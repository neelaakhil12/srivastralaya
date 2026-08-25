import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { UIProvider, useUI } from './context/UIContext';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';
import ProductQuickViewModal from './components/ProductQuickViewModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import SearchModal from './components/SearchModal';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';

import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import ProductsPage from './pages/ProductsPage';
import OurStoryPage from './pages/OurStoryPage';
import ContactPage from './pages/ContactPage';
import AccountPage from './pages/AccountPage';
import SplashScreen from './components/SplashScreen';
import AdminApp from './admin/AdminApp';

function AppContent() {
  const [activePage, setActivePage] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.startsWith('/admin') || hash.startsWith('#admin')) {
      return 'admin';
    }
    return 'home';
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSplash, setShowSplash] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return !path.startsWith('/admin') && !hash.startsWith('#admin');
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash.startsWith('#admin')) {
        setActivePage('admin');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 350,
      offset: 30,
      delay: 0,
      once: true,
      mirror: false,
      easing: 'ease-out',
      anchorPlacement: 'top-bottom',
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [activePage]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
  };

  const handleNavigateToStore = () => {
    setActivePage('home');
    window.history.pushState({}, '', '/');
  };

  // If in Admin portal, render AdminApp directly
  if (activePage === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900 selection:bg-[#701A23] selection:text-white">
        <Toast />
        <AdminApp onNavigateToStore={handleNavigateToStore} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans antialiased text-gray-900 selection:bg-[#701A23] selection:text-white">
      {/* Splash Screen Animation */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

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
        {activePage === 'account' && (
          <AccountPage setActivePage={setActivePage} />
        )}
      </main>

      {/* Global Interactive Modals & Drawers */}
      <ProductQuickViewModal />
      <CartDrawer setActivePage={setActivePage} />
      <WishlistDrawer setActivePage={setActivePage} />
      <SearchModal setActivePage={setActivePage} />
      <AuthModal />

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
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </UIProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
