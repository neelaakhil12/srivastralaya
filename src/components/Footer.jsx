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
            <div className="inline-block bg-white px-5 py-2 sm:px-6 sm:py-3 rounded-full shadow-sm">
              <img src="/logo.png" alt="Sri Vastralaya" className="h-20 sm:h-24 w-auto object-contain" />
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Bringing you timeless sarees, jewellery, and fashion accessories crafted with love, tradition, and affordability. Owned with pride by <span className="text-[#D4AF37] font-semibold">Pranu</span>.
            </p>
            {/* Follow Us Social Media Buttons */}
            <div className="pt-2 space-y-2">
              <p className="text-[11px] uppercase font-bold tracking-widest text-[#D4AF37]">
                FOLLOW US
              </p>
              <div className="flex flex-col gap-2">
                {/* Instagram 1 */}
                <a
                  href="https://www.instagram.com/sri.vastralaya_?igsh=MTlmcXc4N20yamdmbA=="
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#521117] hover:bg-[#E1306C] text-gray-200 hover:text-white transition-all text-xs font-semibold border border-[#701A23] shadow-xs group"
                >
                  <InstagramIcon className="w-4 h-4 text-[#D4AF37] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Instagram (@sri.vastralaya_)</span>
                </a>

                {/* Instagram 2 */}
                <a
                  href="https://www.instagram.com/_sv_collections07?igsh=NTV0aXMyNWllN29x"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#521117] hover:bg-[#E1306C] text-gray-200 hover:text-white transition-all text-xs font-semibold border border-[#701A23] shadow-xs group"
                >
                  <InstagramIcon className="w-4 h-4 text-[#D4AF37] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Instagram (@_sv_collections07)</span>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/1HdpRQVuYP/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#521117] hover:bg-[#1877F2] text-gray-200 hover:text-white transition-all text-xs font-semibold border border-[#701A23] shadow-xs group"
                >
                  <FacebookIcon className="w-4 h-4 text-[#D4AF37] group-hover:text-white transition-colors shrink-0" />
                  <span>Facebook Page</span>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/919618093699"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#521117] hover:bg-[#25D366] text-gray-200 hover:text-white transition-all text-xs font-semibold border border-[#701A23] shadow-xs group"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-white transition-colors shrink-0" />
                  <span>WhatsApp Chat</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wider mb-4 border-b border-[#701A23] pb-2 inline-block">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {['Home', 'Categories', 'Products', 'Our Story', 'Contact', 'Terms & Conditions', 'Privacy Policy'].map((item) => {
                let pageKey = item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                if (item === 'Terms & Conditions') pageKey = 'terms';
                if (item === 'Privacy Policy') pageKey = 'privacy';
                return (
                  <li key={item}>
                    <button
                      onClick={() => handleNav(pageKey === 'home' ? 'home' : pageKey)}
                      className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer"
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
                <span>Owner: </span>
                <span className="text-white font-medium">Pranu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & scroll to top */}
        <div className="pt-6 border-t border-[#521117] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
            <p>© 2026 SV Sri Vastralaya. All Rights Reserved.</p>
            <span className="hidden sm:inline text-gray-600">•</span>
            <button
              onClick={() => handleNav('privacy')}
              className="hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-gray-600">•</span>
            <button
              onClick={() => handleNav('terms')}
              className="hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
            <span>for timeless style &amp; affordability.</span>
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
