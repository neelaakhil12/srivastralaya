import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, Menu, X, Phone, ChevronRight, MessageCircle, User, LogIn } from 'lucide-react';
import { InstagramIcon } from './BrandIcons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setActivePage, onCategorySelect }) {
  const { totalItemsCount, setIsCartOpen, subtotal, standardShippingFee, freeShippingThreshold, enableFreeShipping, shippingConfig } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { setIsSearchOpen } = useUI();
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userInitials = isLoggedIn && user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : null;

  const navLinks = [
    { id: 'home', type: 'page', label: 'HOME' },
    { id: 'products', type: 'page', label: 'SHOP' },
    { id: 'sarees', type: 'category', label: 'SAREES' },
    { id: 'jewellery', type: 'category', label: 'JEWELLERY' },
    { id: 'hair-accessories', type: 'category', label: 'HAIR ACCESSORIES' },
    { id: 'dresses', type: 'category', label: 'DRESSES' },
    { id: 'shirts', type: 'category', label: 'SHIRTS' },
    { id: 't-shirts', type: 'category', label: 'T-SHIRTS' },
    { id: 'photoframes', type: 'category', label: 'PHOTO FRAMES' },
    { id: 'fancy-items', type: 'category', label: 'FANCY ITEMS' },
    { id: 'our-story', type: 'page', label: 'OUR STORY' },
    { id: 'contact', type: 'page', label: 'CONTACT' },
  ];

  const handleNavClick = (link) => {
    if (link.type === 'category') {
      if (onCategorySelect) onCategorySelect(link.id);
      setActivePage('products');
    } else {
      setActivePage(link.id);
      if (link.id === 'products' && onCategorySelect) {
        onCategorySelect('all');
      }
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100 font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-[#701A23] text-white text-[11px] sm:text-xs py-1.5 px-3 border-b border-[#521117]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {(standardShippingFee === 0 || (enableFreeShipping && freeShippingThreshold > 0)) ? (
            <div className="flex items-center gap-1.5 font-medium tracking-wide truncate">
              <span className="hidden sm:inline-block bg-[#D4AF37] text-[#701A23] text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0">Special Offer</span>
              <span className="truncate">
                {standardShippingFee === 0
                  ? '🚚 FREE SHIPPING on all orders across India!'
                  : `🚚 FREE SHIPPING on orders above ₹${freeShippingThreshold.toLocaleString('en-IN')}`}
              </span>
            </div>
          ) : (
            <div className="hidden sm:block" />
          )}

          <div className="flex items-center gap-2.5 text-gray-200 text-[11px] shrink-0">
            <a href="tel:9618093699" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#D4AF37]" />
              <span className="hidden sm:inline">+91 9618093699</span>
            </a>
            <span className="hidden sm:inline text-[#891E2A]">|</span>
            <div className="hidden sm:flex items-center gap-2">
              <span>Follow us:</span>
              <a href="https://www.instagram.com/sri.vastralaya_?igsh=MTlmcXc4N20yamdmbA==" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37] transition-colors" title="Instagram @sri.vastralaya_">
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a href="https://www.facebook.com/share/1HdpRQVuYP/" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37] transition-colors" title="Facebook Page">
                <span className="font-bold text-[11px] hover:underline">fb</span>
              </a>
              <a href="https://wa.me/919618093699" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37] transition-colors" title="WhatsApp">
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header / Brand Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo Brand Title */}
          <div 
            onClick={() => handleNavClick('home')}
            className="cursor-pointer flex items-center group shrink-0 py-0.5"
          >
            <img 
              src="/logo.png" 
              alt="Sri Vastralaya" 
              className="h-20 sm:h-24 md:h-28 lg:h-30 max-w-[150px] sm:max-w-none w-auto object-contain transform group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
            />
          </div>

          {/* Desktop Navigation Links directly in header */}
          <nav className="hidden lg:flex flex-wrap justify-center items-center gap-x-3 xl:gap-x-5 gap-y-1 text-[10px] xl:text-[11px] font-bold tracking-wider max-w-[60%] xl:max-w-[65%]">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link)}
                  className={`relative py-1.5 transition-colors duration-200 ${
                    isActive 
                      ? 'text-[#701A23] font-bold' 
                      : 'text-gray-700 hover:text-[#701A23]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#701A23] rounded-full animate-fadeIn" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-700 hover:text-[#701A23] hover:bg-gray-100 rounded-full transition-colors relative"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="hidden sm:block p-2 text-gray-700 hover:text-[#701A23] hover:bg-gray-100 rounded-full transition-colors relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#701A23] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User / Account */}
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setActivePage('account');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#701A23] to-[#4A0E17] flex items-center justify-center text-white text-[11px] font-bold shadow-sm hover:shadow-md transition-shadow"
                title={`My Account — ${user?.name}`}
              >
                {userInitials}
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                className="p-2 text-gray-700 hover:text-[#701A23] hover:bg-gray-100 rounded-full transition-colors"
                title="Sign In"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Cart Button with badge & total */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 bg-[#701A23] hover:bg-[#521117] text-white px-3.5 py-2 rounded-full shadow-sm transition-all duration-200"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#D4AF37] text-[#701A23] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-semibold text-xs border-l border-[#891E2A] pl-2.5">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-[#701A23] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-slideRight">
            <div className="p-3 bg-[#701A23] text-white flex items-center justify-between">
              <div className="bg-white p-1 rounded-lg">
                <img src="/logo.png" alt="Sri Vastralaya" className="h-24 w-auto object-contain" />
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-gray-200 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-semibold transition-colors ${
                    activePage === link.id
                      ? 'bg-[#FAF0F1] text-[#701A23]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className={`w-4 h-4 ${activePage === link.id ? 'text-[#701A23]' : 'text-gray-400'}`} />
                </button>
              ))}

              <div className="pt-2 border-t border-gray-100 mt-2 space-y-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsWishlistOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#701A23]" />
                    <span>My Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-[#701A23] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount} items
                    </span>
                  )}
                </button>

                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActivePage('account');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#701A23] flex items-center justify-center text-white text-[9px] font-bold">
                        {userInitials}
                      </div>
                      <span>My Account</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-semibold text-[#701A23] hover:bg-[#FAF0F1] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <LogIn className="w-5 h-5 text-[#701A23]" />
                      <span>Sign In / Register</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#701A23]" />
                  </button>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 px-4 space-y-3 text-xs text-gray-600">
                <p className="font-bold uppercase tracking-wider text-[#701A23]">Contact Us</p>
                <a href="tel:9618093699" className="flex items-center gap-2 hover:text-[#701A23]">
                  <Phone className="w-4 h-4 text-[#701A23]" />
                  <span>+91 9618093699</span>
                </a>
                <a href="mailto:Srivastralaya6@gmail.com" className="flex items-center gap-2 hover:text-[#701A23]">
                  <span className="font-semibold text-[#701A23]">@</span>
                  <span>Srivastralaya6@gmail.com</span>
                </a>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-[#FAF8F5] text-center">
              <a
                href="https://wa.me/919618093699"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25D366] text-white py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
