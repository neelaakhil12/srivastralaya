import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Package,
  ShoppingBag,
  Truck,
  Sliders,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AdminCategories from './AdminCategories';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminShipping from './AdminShipping';
import AdminHeroSliders from './AdminHeroSliders';
import { clearAdminSession } from '../services/adminAuth';

export default function AdminLayout({ adminUser, onLogout, onNavigateToStore }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Quick modals triggers from dashboard
  const [addingProductModal, setAddingProductModal] = useState(false);
  const [addingCategoryModal, setAddingCategoryModal] = useState(false);

  const handleLogout = () => {
    clearAdminSession();
    onLogout();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'sliders', label: 'Hero Banners & Sliders', icon: Sliders },
    { id: 'products', label: 'Products & Catalogue', icon: Package },
    { id: 'categories', label: 'Categories & Weaves', icon: Layers },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingBag },
    { id: 'shipping', label: 'Shipping & Delivery Rates', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans antialiased text-gray-900">
      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#4A0E17] text-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl border-r border-[#611621]`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-[#611621] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-white p-1.5 flex items-center justify-center border-2 border-[#D4AF37] shadow-xl shrink-0">
                <img
                  src="/logo.png"
                  alt="Sri Vastralaya"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="font-serif font-bold text-sm tracking-wider text-white">
                  SRI VASTRALAYA
                </h1>
                <p className="text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold">
                  Management Center
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C19B2E] text-[#4A0E17] shadow-lg shadow-[#D4AF37]/20 font-extrabold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#4A0E17]' : 'text-[#D4AF37]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-[#4A0E17]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & User Badge */}
        <div className="p-4 border-t border-[#611621] space-y-3">
          {/* View Live Store Button */}
          <button
            onClick={onNavigateToStore}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
            <span>Open Customer Store</span>
          </button>

          {/* Admin User Info & Logout */}
          <div className="pt-2 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-bold text-white truncate">
                {adminUser?.email || 'srivastralaya6@gmail.com'}
              </p>
              <p className="text-[10px] text-[#D4AF37]">Super Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-white/70 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-xl"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span>Admin</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-bold text-[#701A23] capitalize">
                {activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToStore}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#701A23] hover:text-[#912531] bg-[#FAF0F1] px-3.5 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Website</span>
            </button>
          </div>
        </header>

        {/* Content Views */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              onNavigateTab={setActiveTab}
              onOpenNewProduct={() => {
                setActiveTab('products');
                setAddingProductModal(true);
              }}
              onOpenNewCategory={() => {
                setActiveTab('categories');
                setAddingCategoryModal(true);
              }}
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts
              isAddingNew={addingProductModal}
              onCloseNewModal={() => setAddingProductModal(false)}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategories
              isAddingNew={addingCategoryModal}
              onCloseNewModal={() => setAddingCategoryModal(false)}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders onNavigateShipping={() => setActiveTab('shipping')} />
          )}

          {activeTab === 'sliders' && (
            <AdminHeroSliders />
          )}

          {activeTab === 'shipping' && (
            <AdminShipping />
          )}
        </main>
      </div>
    </div>
  );
}
