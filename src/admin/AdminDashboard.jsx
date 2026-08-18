import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Package,
  Layers,
  ShoppingBag,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Truck,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { getCategories, getProducts, getOrders, updateOrderStatus } from '../services/supabase';

export default function AdminDashboard({ onNavigateTab, onOpenNewProduct, onOpenNewCategory }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, prods, ords] = await Promise.all([
        getCategories(),
        getProducts(),
        getOrders()
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
      setOrders(ords || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate KPIs
  const totalProductsCount = products.length;
  const totalCategoriesCount = categories.length;

  // Pending orders
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing');
  const pendingOrdersCount = pendingOrders.length;

  // Completed orders
  const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Delivered');
  const completedOrdersCount = completedOrders.length;

  // Lifetime Total Earnings (completed + all orders total)
  const totalEarnings = orders.reduce((sum, order) => {
    // include completed orders and existing orders
    if (order.status !== 'Cancelled') {
      return sum + (Number(order.total) || 0);
    }
    return sum;
  }, 0);

  // Daily Earnings (orders created today)
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyEarnings = orders.reduce((sum, order) => {
    if (order.status !== 'Cancelled') {
      const orderDate = (order.createdAt || '').split('T')[0];
      if (orderDate === todayStr) {
        return sum + (Number(order.total) || 0);
      }
    }
    return sum;
  }, 0);

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#701A23] via-[#891E2A] to-[#4A0E17] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-[#D4AF37] border border-[#D4AF37]/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Supabase Live Synchronized
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            Welcome to Sri Vastralaya Management
          </h1>
          <p className="text-sm text-white/80 max-w-xl">
            Real-time business performance, orders overview, Cloudinary asset controls, and inventory metrics.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={onOpenNewProduct}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#bfa035] text-[#4A0E17] rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Daily Earnings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-extrabold text-2xl group-hover:scale-110 transition-transform">
              <span>₹</span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-100/60 text-emerald-800 rounded-full">
              Today
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Daily Earnings</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              ₹{dailyEarnings.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Calculated from today's orders</span>
            </p>
          </div>
        </div>

        {/* 2. Total Earnings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[#FAF0F1] text-[#701A23] rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-[#FAF0F1] text-[#701A23] rounded-full">
              All Time
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Earnings</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#701A23] mt-1">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Cumulative gross sales in Supabase
            </p>
          </div>
        </div>

        {/* 3. Pending Orders */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
              Action Needed
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Orders</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              {pendingOrdersCount}
            </h3>
            <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
              <span>Click to view awaiting dispatches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
        </div>

        {/* 4. Completed Orders */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
              Fulfilled
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Orders</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              {completedOrdersCount}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Successfully processed orders
            </p>
          </div>
        </div>

        {/* 5. Products Count */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full">
              Catalogue
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Products Count</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              {totalProductsCount}
            </h3>
            <p className="text-xs text-purple-600 mt-1 font-medium flex items-center gap-1">
              <span>Manage products & Cloudinary media</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
        </div>

        {/* 6. Categories Count */}
        <div 
          onClick={() => onNavigateTab('categories')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full">
              Sections
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories Count</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              {totalCategoriesCount}
            </h3>
            <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
              <span>Manage categories & subcategories</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-serif font-bold text-lg text-gray-900">Recent Customer Orders</h3>
            <p className="text-xs text-gray-500">Live order activity & quick status fulfillment</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-[#701A23] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No orders recorded yet</p>
            <p className="text-xs mt-1">Orders placed on WhatsApp or website checkout will appear here in real-time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-gray-900">
                      #{order.id}
                    </td>
                    <td className="py-3.5">
                      <p className="font-semibold text-gray-800">{order.customerName}</p>
                      <p className="text-[11px] text-gray-400">{order.customerPhone}</p>
                    </td>
                    <td className="py-3.5 font-bold text-[#701A23]">
                      ₹{Number(order.total).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {order.status !== 'Completed' ? (
                        <button
                          disabled={updatingOrderId === order.id}
                          onClick={() => handleQuickStatusChange(order.id, 'Completed')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-medium text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
