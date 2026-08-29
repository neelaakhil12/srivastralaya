import { useEffect } from 'react';
import { updateSEO, PAGE_SEO, getGSCVerificationCode, setGSCVerificationCode } from '../utils/seo';

/**
 * SEOHead Component
 * Automatically updates document metadata, OpenGraph tags, canonical link,
 * and JSON-LD structured data on client page transitions.
 */
export default function SEOHead({ activePage = 'home', selectedCategory = 'all' }) {
  useEffect(() => {
    // 1. Ensure Google Search Console verification tag is synced if user saved it in admin
    const gscCode = getGSCVerificationCode();
    if (gscCode) {
      setGSCVerificationCode(gscCode);
    }

    // 2. Resolve Page SEO
    const pageMeta = PAGE_SEO[activePage] || PAGE_SEO.home;
    let title = pageMeta.title;
    let description = pageMeta.description;
    let keywords = pageMeta.keywords;

    // Breadcrumbs hierarchy
    const breadcrumbList = [
      { name: 'Home', url: 'https://srivastralaya.com/' }
    ];

    if (activePage !== 'home') {
      const pageNames = {
        categories: 'Categories',
        products: 'Products',
        'our-story': 'Our Story',
        contact: 'Contact Us',
        account: 'My Account',
        terms: 'Terms & Conditions',
        privacy: 'Privacy Policy',
        admin: 'Admin Portal'
      };
      breadcrumbList.push({
        name: pageNames[activePage] || activePage,
        url: `https://srivastralaya.com/${activePage}`
      });
    }

    if (activePage === 'products' && selectedCategory && selectedCategory !== 'all') {
      const formattedCat = selectedCategory.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      title = `${formattedCat} Collection | Sri Vastralaya`;
      description = `Shop authentic and handpicked ${formattedCat} at Sri Vastralaya. High quality fabric, modern designs, and unbeatable affordable prices.`;
      keywords = `${formattedCat}, buy ${formattedCat} online, Sri Vastralaya ${formattedCat}, Indian fashion`;
      breadcrumbList.push({
        name: formattedCat,
        url: `https://srivastralaya.com/products?category=${selectedCategory}`
      });
    }

    // 3. Apply updates to DOM
    updateSEO({
      title,
      description,
      keywords,
      noIndex: pageMeta.noIndex || false,
      breadcrumbList
    });
  }, [activePage, selectedCategory]);

  return null;
}
