import React, { useState, useEffect } from 'react';
import {
  User, Phone, Mail, Package, Download, LogOut, ChevronRight,
  ShoppingBag, Clock, CheckCircle, XCircle, Truck, AlertCircle, FileText, Edit2, Save, X,
  Copy, ExternalLink, Navigation, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateInvoice } from '../utils/generateInvoice';
import { getOrders } from '../services/supabase';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STATUS_STYLES = {
  'Order Accepted': { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle, dot: 'bg-blue-500' },
  'Order Dispatched': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: Truck, dot: 'bg-indigo-500' },
  'Dispatched': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: Truck, dot: 'bg-indigo-500' },
  'Out for Delivery': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Navigation, dot: 'bg-purple-500' },
  'Delivered': { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle, dot: 'bg-emerald-500' },
  'Completed': { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle, dot: 'bg-emerald-500' },
  'Processing': { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock, dot: 'bg-blue-500' },
  'Pending': { bg: 'bg-amber-50', text: 'text-amber-800', icon: Clock, dot: 'bg-amber-500' },
  'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, dot: 'bg-red-500' },
};

function getStatusStyle(status) {
  return STATUS_STYLES[status] || { bg: 'bg-amber-50', text: 'text-amber-800', icon: Clock, dot: 'bg-amber-500' };
}

const DELIVERY_STEPS = [
  'Order Placed',
  'Order Accepted',
  'Dispatched',
  'Out for Delivery',
  'Delivered'
];

function getStepIndex(status) {
  if (status === 'Delivered' || status === 'Completed') return 4;
  if (status === 'Out for Delivery') return 3;
  if (status === 'Order Dispatched' || status === 'Dispatched') return 2;
  if (status === 'Order Accepted' || status === 'Processing') return 1;
  return 0; // Order Placed / Pending
}

function UserAvatar({ name, size = 'lg' }) {
  const initials = (name || 'U')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeClass = size === 'lg'
    ? 'w-20 h-20 text-2xl'
    : size === 'md'
    ? 'w-12 h-12 text-base'
    : 'w-8 h-8 text-xs';

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#701A23] to-[#4A0E17] flex items-center justify-center font-bold text-white shadow-lg shrink-0`}>
      {initials}
    </div>
  );
}

function OrderCard({ order, onDownload }) {
  const [expanded, setExpanded] = useState(true);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const style = getStatusStyle(order.status);
  const currentStep = getStepIndex(order.status);

  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  const itemsCount = (order.items || []).reduce((s, i) => s + (i.quantity || i.qty || 1), 0);

  const handleCopyTracking = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  const courierTitle = order.courierName || 'DTDC Express';
  const trackingLink = order.trackingUrl || (courierTitle.toLowerCase().includes('india post')
    ? 'https://www.indiapost.gov.in/_layouts/15/dpt.cpt.application/tracking.aspx'
    : (courierTitle.toLowerCase().includes('blue dart')
      ? 'https://www.bluedart.com/tracking'
      : (courierTitle.toLowerCase().includes('delhivery')
        ? 'https://www.delhivery.com/tracking'
        : 'https://track.dtdc.com/ctrk-tracking/tracker.html')));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 gap-3 border-b border-gray-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#FAF0F1] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 text-[#701A23]" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm sm:text-base truncate">#{order.id}</p>
            <p className="text-xs text-gray-400 mt-0.5">{date} · {itemsCount} {itemsCount === 1 ? 'item' : 'items'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
            <span className={`w-2 h-2 rounded-full ${style.dot}`} />
            {order.status || 'Order Accepted'}
          </span>
          <p className="text-sm sm:text-base font-extrabold text-[#701A23]">₹{(order.total || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* ── Live Delivery Status Stepper ───────────────────────────────── */}
      {order.status !== 'Cancelled' && (
        <div className="px-4 sm:px-6 pt-4 pb-3 bg-[#FAF0F1]/40 border-b border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
            Delivery Status Progress
          </p>
          <div className="relative flex items-center justify-between">
            {/* Progress line */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0">
              <div
                className="h-full bg-[#701A23] transition-all duration-500"
                style={{ width: `${(currentStep / (DELIVERY_STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {DELIVERY_STEPS.map((step, idx) => {
              const isPassed = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isPassed
                        ? 'bg-[#701A23] text-white shadow-sm ring-2 ring-white'
                        : 'bg-gray-200 text-gray-500'
                    } ${isCurrent ? 'scale-110 ring-4 ring-[#701A23]/20' : ''}`}
                  >
                    {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 font-bold text-center max-w-[60px] leading-tight ${
                      isCurrent
                        ? 'text-[#701A23]'
                        : isPassed
                        ? 'text-gray-800'
                        : 'text-gray-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Courier Tracking Box ──────────────────────────────────── */}
      {order.trackingId && (
        <div className="mx-4 sm:mx-5 my-3.5 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-2xl shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wide">
                  {courierTitle} Tracking
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">AWB / Tracking ID:</span>
                <span className="font-mono font-extrabold text-sm text-gray-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                  {order.trackingId}
                </span>
              </div>
            </div>

            {/* Action Buttons: Copy & Track */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyTracking(order.trackingId)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title="Copy tracking ID to clipboard"
              >
                {copiedTracking ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-600" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>

              <a
                href={trackingLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleCopyTracking(order.trackingId)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#701A23] hover:bg-[#521117] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Track Parcel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <p className="text-[10px] text-blue-800/80 mt-2 font-medium">
            💡 Click <strong>Copy ID</strong>, then click <strong>Track Parcel</strong> to view live courier status.
          </p>
        </div>
      )}

      {/* Expandable Details */}
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[800px]' : 'max-h-0'}`}>
        <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">
          {/* Items */}
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ordered Items</p>
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-200 shrink-0 p-0.5" />
                )}
                {!item.image && (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{item.name || 'Product'}</p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    {item.selectedColor && (
                      <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-1.5 py-0.2 rounded border border-blue-200">
                        Color: {item.selectedColor}
                      </span>
                    )}
                    {item.selectedSize && (
                      <span className="text-[10px] bg-[#701A23]/10 text-[#701A23] font-bold px-1.5 py-0.2 rounded">
                        Size: {item.selectedSize}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-500">
                      Qty: {item.quantity || item.qty || 1}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-extrabold text-gray-900 shrink-0">
                  ₹{((item.price || 0) * (item.quantity || item.qty || 1)).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-3.5 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800">₹{(order.subtotal || 0).toLocaleString('en-IN')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-medium">
                <span>Discount</span>
                <span>-₹{(order.discount || 0).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Shipping</span>
              <span className="font-semibold">{order.shipping > 0 ? `₹${order.shipping.toLocaleString('en-IN')}` : 'FREE'}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5 border-t border-gray-200">
              <span>Total Amount</span>
              <span className="text-[#701A23] text-base font-extrabold">₹{(order.total || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-100 text-xs space-y-1 text-gray-600">
            <p><strong>Payment:</strong> {order.paymentMethod || 'Online (Razorpay)'}</p>
            <p><strong>Delivery Address:</strong> {order.customerAddress || 'N/A'}</p>
          </div>

          {/* Download Invoice */}
          <button
            onClick={() => onDownload(order)}
            className="w-full flex items-center justify-center gap-2 bg-[#701A23] hover:bg-[#521117] text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Official Invoice PDF
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2.5 text-xs font-semibold text-[#701A23] hover:bg-[#FAF0F1] transition-colors border-t border-gray-50 cursor-pointer"
      >
        {expanded ? 'Hide details' : 'View full details & invoice'}
        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
}

export default function AccountPage({ setActivePage }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const initialTab = localStorage.getItem('sv_account_initial_tab');
    if (initialTab) {
      localStorage.removeItem('sv_account_initial_tab');
      return initialTab;
    }
    return 'profile';
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Edit profile
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  // Fetch orders when tab selected
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, user]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const userEmail = (user?.email || '').trim().toLowerCase();
      const userPhone = (user?.phone || '').replace(/\D/g, '');

      // 1. Fetch live orders from Supabase cloud database
      let allCloudOrders = [];
      try {
        allCloudOrders = await getOrders();
      } catch (e) {
        console.warn('Could not fetch orders from Supabase:', e);
      }

      // 2. Local orders fallback
      let rawLocal = [];
      try {
        rawLocal = JSON.parse(localStorage.getItem('sv_user_orders') || '[]');
      } catch (e) {}

      // 3. Filter orders strictly belonging to this logged-in user only!
      const userOrders = [...rawLocal, ...allCloudOrders].filter(o => {
        if (!o) return false;
        const ordEmail = (o.customerEmail || o.email || '').trim().toLowerCase();
        const ordPhone = (o.customerPhone || o.phone || '').replace(/\D/g, '');

        const emailMatch = userEmail && ordEmail && (ordEmail === userEmail || ordEmail.includes(userEmail));
        const phoneMatch = userPhone && ordPhone && (ordPhone === userPhone || ordPhone.endsWith(userPhone) || userPhone.endsWith(ordPhone));

        return emailMatch || phoneMatch;
      });

      // Deduplicate by ID and sort newest first
      const orderMap = new Map();
      userOrders.forEach(o => {
        if (o && o.id) orderMap.set(o.id, o);
      });

      const sorted = Array.from(orderMap.values()).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setOrders(sorted);
    } catch (err) {
      setOrdersError('Could not load orders. Please try again.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDownloadInvoice = (order) => {
    generateInvoice({ ...order, customerName: user?.name || order.customerName });
  };

  const handleLogout = () => {
    logout();
    if (setActivePage) setActivePage('home');
  };

  if (!user) return null;

  const initials = (user.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF0F1] via-white to-[#F9F3DF]">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#701A23] to-[#4A0E17] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative">
          <div className="flex items-center gap-5">
            <UserAvatar name={user.name} size="lg" />
            <div>
              <p className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-1">My Account</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                {user.name}
              </h1>
              <p className="text-white/60 text-sm mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'orders', label: 'My Orders', icon: Package },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#701A23] text-white shadow-md'
                    : 'text-gray-500 hover:text-[#701A23] hover:bg-[#FAF0F1]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Profile Tab ─────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-800">Personal Details</h2>
                {!editMode ? (
                  <button
                    onClick={() => { setEditMode(true); setEditName(user.name); setEditPhone(user.phone); }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#701A23] font-bold hover:bg-[#FAF0F1] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => setEditMode(false)}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-bold hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-50">
                  <UserAvatar name={user.name} size="md" />
                  <div>
                    <p className="font-bold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400">Customer Account</p>
                  </div>
                </div>

                {editMode ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#701A23]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#701A23]"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Note: Email cannot be changed. Contact support to update email.</p>
                    <button
                      onClick={() => {
                        // Save locally (no API for profile update yet, just updates context display)
                        setEditMode(false);
                      }}
                      className="flex items-center gap-2 bg-[#701A23] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#521117] transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { icon: User, label: 'Full Name', value: user.name },
                      { icon: Phone, label: 'Phone Number', value: user.phone ? `+91 ${user.phone}` : 'Not set' },
                      { icon: Mail, label: 'Email Address', value: user.email },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-[#FAF0F1] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-[#701A23]" />
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 font-medium">{label}</p>
                          <p className="text-sm font-bold text-gray-800">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-800">Quick Actions</h2>
              </div>
              <div className="divide-y divide-gray-50">
                <button
                  onClick={() => setActiveTab('orders')}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAF0F1] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF0F1] group-hover:bg-[#f0d5d7] flex items-center justify-center transition-colors">
                      <Package className="w-4 h-4 text-[#701A23]" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">My Orders</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#701A23] transition-colors" />
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAF0F1] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF0F1] group-hover:bg-[#f0d5d7] flex items-center justify-center transition-colors">
                      <FileText className="w-4 h-4 text-[#701A23]" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Download Invoices</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#701A23] transition-colors" />
                </button>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 border-2 border-red-100 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-2xl font-bold text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}

        {/* ── Orders Tab ──────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">Order History</h2>
              <button
                onClick={fetchOrders}
                disabled={ordersLoading}
                className="text-xs text-[#701A23] font-bold hover:underline disabled:opacity-50"
              >
                {ordersLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {ordersLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-3 border-[#701A23] border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
              </div>
            )}

            {!ordersLoading && ordersError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-600 font-medium">{ordersError}</p>
                <button onClick={fetchOrders} className="mt-3 text-xs text-[#701A23] font-bold hover:underline">Try again</button>
              </div>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <ShoppingBag className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-500 mb-1">No orders yet</h3>
                <p className="text-sm text-gray-400 mb-4">When you place an order, it will appear here.</p>
                <button
                  onClick={() => setActivePage && setActivePage('products')}
                  className="bg-[#701A23] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#521117] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            )}

            {!ordersLoading && orders.length > 0 && (
              <div className="space-y-3">
                {orders.map(order => (
                  <OrderCard key={order.id} order={order} onDownload={handleDownloadInvoice} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
