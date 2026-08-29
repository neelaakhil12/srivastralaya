/**
 * Sri Vastralaya SEO Management Utilities
 * Handles page title, meta description, keywords, canonical URL, and JSON-LD structured data dynamically.
 */

export const DEFAULT_SEO = {
  title: 'Sri Vastralaya - Stylish & Affordable Fashion for Every Occasion',
  description: 'Discover beautiful sarees, stylish dresses, jewellery, hair accessories, shirts, T-shirts, photoframes & fancy fashion items at affordable prices from Sri Vastralaya.',
  keywords: 'Sri Vastralaya, Sarees, Jewellery, Hair Accessories, Fashion, Dresses, Shirts, T-Shirts, Fancy Items, Photoframes, Affordable Fashion, Pranu, Silk Sarees, Cotton Sarees',
  canonicalUrl: 'https://srivastralaya.com/',
  ogImage: 'https://srivastralaya.com/logo.png',
  siteName: 'Sri Vastralaya'
};

export const PAGE_SEO = {
  home: {
    title: 'Sri Vastralaya - Sarees, Jewellery & Affordable Fashion | Official Store',
    description: 'Explore the finest collection of handcrafted sarees, ethnic jewellery, hair accessories, and casual wear at honest, affordable prices from Sri Vastralaya.',
    keywords: 'Sri Vastralaya home, affordable sarees online, jewellery accessories, bridal sarees, festive fashion, Pranu',
    path: '/'
  },
  categories: {
    title: 'Browse All Categories - Sarees, Jewellery, Dresses | Sri Vastralaya',
    description: 'Shop by category at Sri Vastralaya: Sarees, Hair Accessories, Jewellery, Dresses, Shirts, T-Shirts, and Photoframes & Fancy Items.',
    keywords: 'saree categories, jewellery categories, dress collections, fashion accessories online, Sri Vastralaya',
    path: '/categories'
  },
  products: {
    title: 'All Fashion Products & Collections | Sri Vastralaya',
    description: 'Discover handcrafted sarees, gleaming jewellery, clips, stylish shirts and festive attire. Fast WhatsApp ordering with transparent pricing.',
    keywords: 'buy sarees online, fashion jewellery, ethnic dresses, hair accessories shop, affordable fashion catalog',
    path: '/products'
  },
  'our-story': {
    title: 'Our Story & Heritage - Sri Vastralaya | Founded by Pranu',
    description: 'Learn about Sri Vastralaya founded by Pranu. Dedicated to bringing high-quality traditional sarees, jewellery, and fashion without excessive price tags.',
    keywords: 'about Sri Vastralaya, Pranu founder, our story, Indian fashion heritage, trusted saree brand',
    path: '/our-story'
  },
  contact: {
    title: 'Contact Us & WhatsApp Support | Sri Vastralaya',
    description: 'Get in touch with Sri Vastralaya directly via WhatsApp (+91 9618093699) or email (srivastralaya6@gmail.com) for saree inquiries, order status, and personalized recommendations.',
    keywords: 'contact Sri Vastralaya, WhatsApp saree store, customer support, fashion inquiries',
    path: '/contact'
  },
  account: {
    title: 'My Account & Order History | Sri Vastralaya',
    description: 'Manage your profile, track active orders, view wishlist items, and manage shipping addresses on Sri Vastralaya.',
    keywords: 'Sri Vastralaya account, order history, profile settings',
    path: '/account'
  },
  admin: {
    title: 'Admin Management Portal 🔐 | Sri Vastralaya',
    description: 'Sri Vastralaya Administrative and Catalog Management Dashboard.',
    keywords: 'admin, catalog management',
    path: '/admin',
    noIndex: true
  }
};

/**
 * Updates document head meta tags reactively
 */
export function updateSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  noIndex = false,
  productSchema = null,
  breadcrumbList = null
}) {
  if (typeof document === 'undefined') return;

  const resolvedTitle = title || DEFAULT_SEO.title;
  const resolvedDesc = description || DEFAULT_SEO.description;
  const resolvedKeywords = keywords || DEFAULT_SEO.keywords;
  const resolvedCanonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : DEFAULT_SEO.canonicalUrl);
  const resolvedOgImage = ogImage || DEFAULT_SEO.ogImage;

  // Title
  document.title = resolvedTitle;

  // Helper for setting meta tags
  const setMeta = (name, content, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard Meta Tags
  setMeta('description', resolvedDesc);
  setMeta('keywords', resolvedKeywords);
  setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  // Open Graph
  setMeta('og:title', resolvedTitle, true);
  setMeta('og:description', resolvedDesc, true);
  setMeta('og:url', resolvedCanonical, true);
  setMeta('og:image', resolvedOgImage, true);

  // Twitter Card
  setMeta('twitter:title', resolvedTitle);
  setMeta('twitter:description', resolvedDesc);
  setMeta('twitter:image', resolvedOgImage);

  // Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', resolvedCanonical);

  // Dynamic Product JSON-LD Injection
  const existingProductScript = document.getElementById('dynamic-product-jsonld');
  if (productSchema) {
    let script = existingProductScript;
    if (!script) {
      script = document.createElement('script');
      script.id = 'dynamic-product-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(productSchema);
  } else if (existingProductScript) {
    existingProductScript.remove();
  }

  // Dynamic Breadcrumbs JSON-LD Injection
  const existingBreadcrumbScript = document.getElementById('dynamic-breadcrumb-jsonld');
  if (breadcrumbList && breadcrumbList.length > 0) {
    let script = existingBreadcrumbScript;
    if (!script) {
      script = document.createElement('script');
      script.id = 'dynamic-breadcrumb-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbList.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url
      }))
    });
  } else if (existingBreadcrumbScript) {
    existingBreadcrumbScript.remove();
  }
}

/**
 * Get or sync Google Search Console verification code from localStorage/env
 */
export function getGSCVerificationCode() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('sv_gsc_verification_code');
    if (saved) return saved;
  }
  return '';
}

export function setGSCVerificationCode(code) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('sv_gsc_verification_code', code);
  }
  const el = document.getElementById('google-site-verification');
  if (el) {
    el.setAttribute('content', code || 'google-search-console-verification-code');
  }
}
