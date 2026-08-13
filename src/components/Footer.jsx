import React from 'react';
import { Phone, Mail, MessageCircle, Heart, ArrowUp } from 'lucide-react';
import { InstagramIcon, FacebookIcon } from './BrandIcons';

export default function Footer({ setActivePage, onCategorySelect }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (pageId) => {
    setActivePage(pageId);
    scrollToTop();
  };

  return (
    <footer className="bg-[#420B10] text-gray-200 border-t-4 border-[#D4AF37] font-sans relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="bg-white p-2.5 rounded-xl inline-block shadow-md border border-[#D4AF37]/30">
              <img src="/logo.png" alt="Sri Vastralaya" className="h-24 sm:h-28 w-auto object-contain" />
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Bringing you timeless sarees, jewellery, and fashion accessories crafted with love, tradition, and affordability. Owned with pride by <span className="text-[#D4AF37] font-semibold">Praveen & Siri</span>.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#521117] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#701A23] transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#521117] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#701A23] transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="https://wa.me/919618093699" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#521117] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#25D366] transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wider mb-4 border-b border-[#701A23] pb-2 inline-block">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {['Home', 'Categories', 'Products', 'Our Story', 'Contact'].map((item) => {
                const pageKey = item.toLowerCase().replace(' ', '-');
                return (
                  <li key={item}>
                    <button
                      onClick={() => handleNav(pageKey === 'home' ? 'home' : pageKey)}
                      className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5"
                    >
                      <span className="text-[#D4AF37]">›</span> {item}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Main Categories */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wider mb-4 border-b border-[#701A23] pb-2 inline-block">
              FEATURED CATEGORIES
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { name: 'Sarees', id: 'sarees' },
                { name: 'Dresses', id: 'dresses' },
                { name: 'Jewellery', id: 'jewellery' },
                { name: 'Hair Accessories', id: 'hair-accessories' },
                { name: 'Shirts & T-Shirts', id: 'shirts' },
                { name: 'Photoframes & Fancy Items', id: 'fancy-items' },
              ].map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      if (onCategorySelect) onCategorySelect(cat.id);
                      handleNav('products');
                    }}
                    className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-[#D4AF37]">›</span> {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wider mb-4 border-b border-[#701A23] pb-2 inline-block">
              CONTACT US
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-gray-300">
              <p className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <a href="tel:9618093699" className="hover:text-white transition-colors">
                  +91 9618093699
                </a>
              </p>
              <p className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                <a href="https://wa.me/919618093699" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  +91 9618093699 (WhatsApp)
                </a>
              </p>
              <p className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <a href="mailto:Srivastralaya6@gmail.com" className="hover:text-white transition-colors break-all">
                  Srivastralaya6@gmail.com
                </a>
              </p>
              <div className="pt-2 text-xs text-gray-400 border-t border-[#521117] mt-3">
                <span>Owners: </span>
                <span className="text-white font-medium">Praveen & Siri</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & scroll to top */}
        <div className="pt-6 border-t border-[#521117] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 SV Sri Vastralaya. All Rights Reserved.</p>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
            <span>for timeless style & affordability.</span>
          </div>
          <button
            onClick={scrollToTop}
            className="w-8 h-8 bg-[#701A23] hover:bg-[#891E2A] text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
