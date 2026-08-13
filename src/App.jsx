import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { UIProvider, useUI } from './context/UIContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';
import ProductQuickViewModal from './components/ProductQuickViewModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import SearchModal from './components/SearchModal';
import Toast from './components/Toast';

import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import ProductsPage from './pages/ProductsPage';
import OurStoryPage from './pages/OurStoryPage';
import ContactPage from './pages/ContactPage';

function AppContent() {
  const [activePage, setActivePage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [activePage]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans antialiased text-gray-900 selection:bg-[#701A23] selection:text-white">
      {/* Toast Feedback */}
      <Toast />

      {/* Sticky Header */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onCategorySelect={handleCategorySelect}
      />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            setActivePage={setActivePage}
            onCategorySelect={handleCategorySelect}
          />
        )}
        {activePage === 'categories' && (
          <CategoriesPage
            setActivePage={setActivePage}
            onCategorySelect={handleCategorySelect}
          />
        )}
        {activePage === 'products' && (
          <ProductsPage
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}
        {activePage === 'our-story' && (
          <OurStoryPage
            setActivePage={setActivePage}
          />
        )}
        {activePage === 'contact' && (
          <ContactPage />
        )}
      </main>

      {/* Global Interactive Modals & Drawers */}
      <ProductQuickViewModal />
      <CartDrawer setActivePage={setActivePage} />
      <WishlistDrawer setActivePage={setActivePage} />
      <SearchModal setActivePage={setActivePage} />

      {/* Permanent Floating WhatsApp Action Widget */}
      <WhatsAppFloatingButton />

      {/* Footer */}
      <Footer
        setActivePage={setActivePage}
        onCategorySelect={handleCategorySelect}
      />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <UIProvider>
          <AppContent />
        </UIProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
