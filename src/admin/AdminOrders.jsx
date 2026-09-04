import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  Plus,
  Trash2,
  X,
  Loader2,
  Phone,
  MapPin,
  Truck,
  ExternalLink,
  Check,
  Save,
  Banknote,
  CreditCard,
  AlertCircle,
  FileText
} from 'lucide-react';
import { getOrders, updateOrderStatus, updateOrderTracking, addOrder, deleteOrder } from '../services/supabase';
import { generateInvoice } from '../utils/generateInvoice';

export default function AdminOrders({ onNavigateShipping }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Helper to reliably identify Cash on Delivery orders
  const isCODOrder = (order) => {
    const pm = (order?.paymentMethod || '').toLowerCase();
    return pm.includes('cod') || pm.includes('cash');
  };

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    status: '',
    courierName: 'DTDC Express',
    trackingId: '',
    trackingUrl: ''
  });
  const [savingTracking, setSavingTracking] = useState(false);
  const [trackingSuccess, setTrackingSuccess] = useState(false);

  useEffect(() => {
    fetchOrdersList();
  }, []);

  const fetchOrdersList = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTrackingModal = (order, forcedStatus = null) => {
    setSelectedOrder(order);
    setTrackingForm({
      status: forcedStatus || order.status || 'Order Dispatched',
      courierName: order.courierName || 'DTDC Express',
      trackingId: order.trackingId || '',
      trackingUrl: order.trackingUrl || ''
    });
    setTrackingSuccess(false);
    setIsTrackingModalOpen(true);
  };

  const handleOpenOrderDetails = (order) => {
    setSelectedOrder(order);
    setTrackingForm({
      status: order.status || 'Order Accepted',
      courierName: order.courierName || 'DTDC Express',
      trackingId: order.trackingId || '',
      trackingUrl: order.trackingUrl || ''
    });
    setTrackingSuccess(false);
  };

  const handleSaveTracking = async (e) => {
    e?.preventDefault();
    if (!selectedOrder) return;
    setSavingTracking(true);
    setTrackingSuccess(false);

    try {
      const payload = {
        status: trackingForm.status,
        courierName: trackingForm.courierName || 'DTDC Express',
        trackingId: trackingForm.trackingId.trim(),
        trackingUrl: trackingForm.trackingUrl ? trackingForm.trackingUrl.trim() : ''
      };

      await updateOrderTracking(selectedOrder.id, payload);

      const updated = {
        ...selectedOrder,
        ...payload
      };

      setSelectedOrder(updated);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o));
      setTrackingSuccess(true);
      setTimeout(() => {
        setTrackingSuccess(false);
        setIsTrackingModalOpen(false);
      }, 1200);
    } catch (err) {
      alert('Failed to update tracking: ' + err.message);
    } finally {
      setSavingTracking(false);
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    // If setting to Dispatched or Out for Delivery, pop open the tracking input modal immediately!
    if (newStatus === 'Order Dispatched' || newStatus === 'Out for Delivery' || newStatus === 'Dispatched') {
      handleOpenTrackingModal(order, newStatus);
      return;
    }

    try {
      await updateOrderStatus(order.id, newStatus);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        setTrackingForm(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm(`Delete order #${orderId}?`)) return;
    try {
      await deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    } catch (err) {
      alert('Failed to delete order: ' + err.message);
    }
  };

  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
                          (order.id && order.id.toLowerCase().includes(q)) ||
                          (order.customerName && order.customerName.toLowerCase().includes(q)) ||
                          (order.customerPhone && order.customerPhone.includes(q)) ||
                          (order.paymentMethod && order.paymentMethod.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' ||
                           (paymentFilter === 'cod' && isCODOrder(order)) ||
                           (paymentFilter === 'online' && !isCODOrder(order));
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Action bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#701A23]" />
              <span>Orders Management</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Track customer orders, process fulfillment, and monitor daily revenue
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onNavigateShipping && (
              <button
                onClick={onNavigateShipping}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                title="Edit Store Shipping Charges & Delivery Rules"
              >
                <Truck className="w-4 h-4 text-[#701A23]" />
                <span>Shipping Charges</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order ID, customer, phone, or COD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#701A23]"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#701A23]"
          >
            <option value="all">All Payments</option>
            <option value="cod">💵 Cash on Delivery (COD)</option>
            <option value="online">💳 Paid Online</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#701A23]"
          >
            <option value="all">All Order Statuses</option>
            <option value="Order Accepted">Order Accepted</option>
            <option value="Order Dispatched">Order Dispatched</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#701A23] mb-2" />
            <p className="text-xs font-medium">Fetching orders from Supabase...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-gray-400 px-4">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-bold text-gray-700">No orders found</p>
            <p className="text-xs text-gray-500 mt-1">Customer orders placed online or via WhatsApp will appear here.</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View (Visible on small screens) */}
            <div className="block md:hidden divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-3 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-gray-900 text-xs">#{order.id}</span>
                      <p className="text-[11px] text-gray-400">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-[#701A23] block">
                        ₹{Number(order.total).toLocaleString('en-IN')}
                      </span>
                      {isCODOrder(order) ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 mt-1 shadow-2xs">
                          <Banknote className="w-3 h-3 text-amber-700" />
                          <span>Cash on Delivery</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 mt-1">
                          <CreditCard className="w-3 h-3 text-emerald-600" />
                          <span>Paid Online</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{order.customerName || 'Customer'}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{order.customerPhone || 'N/A'}</span>
                      </p>
                    </div>
                    <span className="text-gray-500 text-[11px] bg-gray-100 px-2 py-0.5 rounded-md">
                      {order.items?.length || 1} items
                    </span>
                  </div>

                  {/* Mobile Status Dropdown & DTDC tracking */}
                  <div className="space-y-1.5 pt-1">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      className={`w-full text-xs font-bold rounded-xl px-3 py-2 border focus:outline-none cursor-pointer ${
                        order.status === 'Delivered' || order.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : order.status === 'Out for Delivery'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : order.status === 'Order Dispatched' || order.status === 'Dispatched'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : order.status === 'Order Accepted'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : order.status === 'Cancelled'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <option value="Order Accepted">Order Accepted</option>
                      <option value="Order Dispatched">Order Dispatched</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenTrackingModal(order)}
                        className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 py-1.5 px-3 rounded-xl border border-blue-200 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{order.trackingId ? `DTDC: ${order.trackingId}` : '+ Set DTDC Tracking'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenOrderDetails(order)}
                        className="p-2 text-gray-700 bg-gray-100 hover:bg-[#FAF0F1] hover:text-[#701A23] rounded-xl transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(order.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Visible on tablets & desktop) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF0F1]/50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Items Count</th>
                    <th className="py-3.5 px-4">Total &amp; Payment</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{order.customerName || 'Customer'}</p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{order.customerPhone || 'N/A'}</span>
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-700">
                        {order.items?.length || 1} items
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-extrabold text-sm text-[#701A23] block">
                            ₹{Number(order.total).toLocaleString('en-IN')}
                          </span>
                          {isCODOrder(order) ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs whitespace-nowrap">
                              <Banknote className="w-3 h-3 text-amber-700" />
                              <span>Cash on Delivery</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                              <CreditCard className="w-3 h-3 text-emerald-600" />
                              <span>Paid Online</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Today'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5 min-w-[150px]">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            className={`w-full text-[11px] font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none cursor-pointer ${
                              order.status === 'Delivered' || order.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : order.status === 'Out for Delivery'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : order.status === 'Order Dispatched' || order.status === 'Dispatched'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : order.status === 'Order Accepted'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : order.status === 'Cancelled'
                                ? 'bg-red-50 text-red-800 border-red-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <option value="Order Accepted">Order Accepted</option>
                            <option value="Order Dispatched">Order Dispatched</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          {order.trackingId ? (
                            <button
                              onClick={() => handleOpenTrackingModal(order)}
                              className="w-full flex items-center justify-between text-[10px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md border border-blue-200 transition-colors cursor-pointer"
                              title="Click to edit DTDC tracking details"
                            >
                              <span className="flex items-center gap-1">
                                <Truck className="w-3 h-3 text-blue-600" />
                                <span>DTDC: {order.trackingId}</span>
                              </span>
                              <span className="text-[9px] text-blue-600 underline">Edit</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenTrackingModal(order)}
                              className="w-full flex items-center justify-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-[#701A23] bg-gray-50 hover:bg-[#FAF0F1] px-2 py-0.5 rounded border border-gray-200 transition-colors cursor-pointer"
                            >
                              <Truck className="w-3 h-3 text-gray-400" />
                              <span>+ Set DTDC Tracking</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenOrderDetails(order)}
                            className="p-1.5 text-gray-600 hover:text-[#701A23] hover:bg-[#FAF0F1] rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-2xl relative animate-fadeIn border border-gray-100 max-h-[94vh] overflow-y-auto overflow-x-hidden min-w-0 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-[11px] font-mono text-gray-400">Order Summary</span>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-gray-900 truncate">
                  #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* HIGH VISIBILITY CASH ON DELIVERY (COD) BANNER */}
            {isCODOrder(selectedOrder) ? (
              <div className="mt-3.5 p-3.5 bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 border-2 border-amber-400 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-[11px] tracking-wider uppercase bg-amber-600 text-white px-2 py-0.5 rounded-md">
                        CASH ON DELIVERY (COD)
                      </span>
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded">
                        Payment Pending
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-medium mt-1 leading-tight">
                      Collect full cash payment from customer upon delivery.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-300">
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-amber-800">To Collect</span>
                  <span className="font-extrabold text-sm sm:text-base text-amber-950">
                    ₹{Number(selectedOrder.total).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-3.5 p-3 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs uppercase text-emerald-900">Paid Online (Razorpay)</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Payment Received</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">Prepaid order — Do NOT collect cash from customer</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                  PAID
                </span>
              </div>
            )}

            {/* Customer info */}
            <div className="my-3.5 p-4 bg-gray-50 rounded-2xl space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between items-start">
                <p className="font-bold text-sm text-gray-900">{selectedOrder.customerName}</p>
                {selectedOrder.paymentMethod && (
                  isCODOrder(selectedOrder) ? (
                    <span className="text-[11px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1">
                      <Banknote className="w-3.5 h-3.5 text-amber-700" />
                      <span>Cash on Delivery</span>
                    </span>
                  ) : (
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedOrder.paymentMethod}</span>
                    </span>
                  )
                )}
              </div>
              <p className="flex items-center gap-2 text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{selectedOrder.customerPhone}</span>
              </p>
              {selectedOrder.customerEmail && (
                <p className="flex items-center gap-2 text-gray-600">
                  <span className="w-3.5 h-3.5 text-gray-400 text-center font-bold">@</span>
                  <span>{selectedOrder.customerEmail}</span>
                </p>
              )}
              {selectedOrder.customerAddress && (
                <p className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <span>{selectedOrder.customerAddress}</span>
                </p>
              )}
            </div>

            {/* Delivery Status & DTDC Tracking Form */}
            <div className="bg-[#FAF0F1]/60 border border-[#F5DCD0] rounded-2xl p-4 my-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#701A23]" />
                  <span className="font-bold text-xs text-gray-900 uppercase tracking-wide">
                    Delivery &amp; Courier Tracking
                  </span>
                </div>
                {selectedOrder.trackingId && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    Tracking Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Delivery Status
                  </label>
                  <select
                    value={trackingForm.status}
                    onChange={(e) => setTrackingForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:border-[#701A23]"
                  >
                    <option value="Order Accepted">Order Accepted</option>
                    <option value="Order Dispatched">Order Dispatched</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={trackingForm.courierName}
                    onChange={(e) => setTrackingForm(prev => ({ ...prev, courierName: e.target.value }))}
                    placeholder="e.g. DTDC Express / India Post"
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#701A23]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Tracking / AWB ID
                  </label>
                  <input
                    type="text"
                    value={trackingForm.trackingId}
                    onChange={(e) => setTrackingForm(prev => ({ ...prev, trackingId: e.target.value }))}
                    placeholder="e.g. D58921044 / W982314"
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-[#701A23]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Direct Tracking Link / URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={trackingForm.trackingUrl}
                    onChange={(e) => setTrackingForm(prev => ({ ...prev, trackingUrl: e.target.value }))}
                    placeholder="https://track.dtdc.com/ctrk-tracking/tracker.html"
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-blue-700 font-mono focus:outline-none focus:border-[#701A23]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {trackingSuccess ? (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Tracking details updated!
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400">
                    Customer will see live status &amp; tracking ID in their account.
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSaveTracking}
                  disabled={savingTracking}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#701A23] hover:bg-[#521117] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {savingTracking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Tracking</span>
                </button>
              </div>
            </div>

            {/* Itemized List */}
            <div className="space-y-2 max-h-52 overflow-y-auto border-t border-b border-gray-100 py-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ordered Products</p>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1.5">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-gray-800 truncate">{item.name}</p>
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
                        Qty: {item.quantity || 1} x ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-[#701A23]">
                    ₹{((item.quantity || 1) * Number(item.price)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals & Payment Breakdown */}
            <div className="pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount:</span>
                  <span>-₹{Number(selectedOrder.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              {selectedOrder.shipping > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee:</span>
                  <span>₹{Number(selectedOrder.shipping).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Order Value:</span>
                <span className="text-[#701A23]">₹{Number(selectedOrder.total).toLocaleString('en-IN')}</span>
              </div>

              {/* Exact Payment Collection Status Card */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                isCODOrder(selectedOrder)
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  {isCODOrder(selectedOrder) ? (
                    <Banknote className="w-4 h-4 text-amber-700 shrink-0" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                  )}
                  <div>
                    <p className="font-extrabold uppercase tracking-wide text-[11px]">
                      {isCODOrder(selectedOrder) ? 'Mode: Cash on Delivery (COD)' : 'Mode: Paid Online'}
                    </p>
                    <p className="text-[10px] font-normal text-gray-600">
                      {isCODOrder(selectedOrder)
                        ? 'Collect this exact cash amount from customer upon delivery'
                        : 'Prepaid via Razorpay · Full amount already received'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase block text-gray-500 font-bold">
                    {isCODOrder(selectedOrder) ? 'Collect Cash' : 'Status'}
                  </span>
                  <span className={`text-sm font-extrabold ${isCODOrder(selectedOrder) ? 'text-amber-900' : 'text-emerald-700'}`}>
                    {isCODOrder(selectedOrder) ? `₹${Number(selectedOrder.total).toLocaleString('en-IN')}` : 'PAID'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => generateInvoice(selectedOrder)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-[#FAF0F1] text-gray-800 hover:text-[#701A23] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-gray-200 transition-colors cursor-pointer"
                title="Download Official PDF Invoice"
              >
                <FileText className="w-4 h-4 text-[#701A23]" />
                <span>Download Invoice</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick DTDC Tracking & Dispatch Modal ───────────────────────── */}
      {isTrackingModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-7 shadow-2xl relative animate-fadeIn border border-gray-100 max-h-[94vh] overflow-y-auto overflow-x-hidden min-w-0 my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                    Courier &amp; Tracking Details
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono truncate">
                    Order #{selectedOrder.id} · {selectedOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* COD Reminder Banner for Dispatch */}
            {isCODOrder(selectedOrder) ? (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-extrabold uppercase text-[11px] block">CASH ON DELIVERY SHIPMENT</span>
                    <span className="text-[10px] text-amber-800">
                      Mark COD on courier waybill. Collect: ₹{Number(selectedOrder.total).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <span className="font-extrabold text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md shrink-0">
                  COD
                </span>
              </div>
            ) : (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-[11px] font-bold">Prepaid Online Order (No cash collection needed)</span>
                </div>
                <span className="font-extrabold text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md shrink-0">
                  PREPAID
                </span>
              </div>
            )}

            <form onSubmit={handleSaveTracking} className="space-y-3.5 mt-3.5 text-xs">
              {/* Delivery Status */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Delivery Status *
                </label>
                <select
                  value={trackingForm.status}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                >
                  <option value="Order Accepted">Order Accepted</option>
                  <option value="Order Dispatched">Order Dispatched</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Courier Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wide">
                    Courier Partner Name
                  </label>
                  <div className="flex gap-1">
                    {['DTDC', 'India Post', 'Blue Dart', 'Delhivery'].map(name => (
                      <button
                        type="button"
                        key={name}
                        onClick={() => {
                          let defaultUrl = '';
                          if (name === 'DTDC') defaultUrl = 'https://track.dtdc.com/ctrk-tracking/tracker.html';
                          else if (name === 'India Post') defaultUrl = 'https://www.indiapost.gov.in/_layouts/15/dpt.cpt.application/tracking.aspx';
                          else if (name === 'Blue Dart') defaultUrl = 'https://www.bluedart.com/tracking';
                          else if (name === 'Delhivery') defaultUrl = 'https://www.delhivery.com/tracking';
                          setTrackingForm(prev => ({
                            ...prev,
                            courierName: name === 'DTDC' ? 'DTDC Express' : name,
                            trackingUrl: prev.trackingUrl || defaultUrl
                          }));
                        }}
                        className="text-[10px] font-bold text-gray-600 hover:text-[#701A23] bg-gray-100 hover:bg-[#FAF0F1] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={trackingForm.courierName}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, courierName: e.target.value }))}
                  placeholder="e.g. DTDC Express, India Post, Blue Dart"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                />
              </div>

              {/* Tracking ID / AWB */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Tracking ID / AWB Number *
                </label>
                <input
                  type="text"
                  required
                  value={trackingForm.trackingId}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, trackingId: e.target.value }))}
                  placeholder="Paste Tracking ID (e.g. D58921044 / W982314)"
                  className="w-full px-3.5 py-2.5 bg-blue-50/50 border border-blue-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">Customer can click to copy this tracking number in their account.</p>
              </div>

              {/* Direct Tracking URL / Link */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wide">
                    Direct Tracking Link / URL (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setTrackingForm(prev => ({
                      ...prev,
                      trackingUrl: 'https://track.dtdc.com/ctrk-tracking/tracker.html'
                    }))}
                    className="text-[10px] font-bold text-[#701A23] hover:underline cursor-pointer"
                  >
                    + DTDC Default Link
                  </button>
                </div>
                <input
                  type="url"
                  value={trackingForm.trackingUrl}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, trackingUrl: e.target.value }))}
                  placeholder="https://track.dtdc.com/ctrk-tracking/tracker.html"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-blue-700 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">Direct webpage URL where the customer can click to track their parcel.</p>
              </div>

              {trackingSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Tracking details saved! Updated in customer account.</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsTrackingModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTracking}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#701A23] hover:bg-[#521117] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {savingTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save &amp; Update Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
