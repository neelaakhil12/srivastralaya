import React, { useState } from 'react';
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Truck,
  Check,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  Loader,
  ShieldCheck,
  Navigation,
  Download
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addOrder } from '../services/supabase';
import { generateInvoice } from '../utils/generateInvoice';

export default function CartDrawer({ setActivePage }) {
  const {
    cartItems, isCartOpen, setIsCartOpen,
    removeFromCart, updateQuantity, subtotal,
    isFreeShipping, currentShippingCharge, standardShippingFee,
    freeShippingThreshold, enableFreeShipping,
    amountNeededForFreeShipping, shippingConfig, clearCart
  } = useCart();
  const { user } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Checkout flow states: 'cart' | 'form' | 'success'
  const [checkoutView, setCheckoutView] = useState('cart');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [successOrderId, setSuccessOrderId] = useState('');
  const [completedOrderData, setCompletedOrderData] = useState(null);

  // Customer Delivery Details
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custPincode, setCustPincode] = useState('');

  // Geolocation state
  const [locating, setLocating] = useState(false);
  const [locatingMsg, setLocatingMsg] = useState('');

  // Open Checkout Form & prefill from current user profile
  const handleOpenCheckoutForm = () => {
    setCustName(user?.name || '');
    setCustEmail(user?.email || '');
    setCustPhone(user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : '');
    setCustAddress(user?.address || '');
    setCustPincode(user?.pincode || '');
    setPayError('');
    setLocatingMsg('');
    setCheckoutView('form');
  };

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'SRI10' || couponCode.trim().toUpperCase() === 'WELCOME10') {
      setDiscountPercent(10);
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try SRI10 for 10% OFF!');
    }
  };

  const discountAmount = (subtotal * discountPercent) / 100;
  const shippingCharge = currentShippingCharge;
  const finalTotal = subtotal - discountAmount;
  const grandTotal = Math.max(0, finalTotal + shippingCharge);

  // ── Locate Me / GPS Detection ─────────────────────────────────────────────
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setPayError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocatingMsg('Detecting your GPS location...');
    setPayError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const streetParts = [
              addr.road,
              addr.suburb || addr.neighbourhood || addr.residential,
              addr.city || addr.town || addr.village || addr.county,
              addr.state
            ].filter(Boolean);
            const street = streetParts.join(', ');
            const postcode = addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : '';

            if (street) {
              setCustAddress(street);
            }
            if (postcode) {
              setCustPincode(postcode);
            }
            setLocatingMsg(`📍 Auto-filled from GPS: ${data.display_name?.slice(0, 55)}...`);
          } else {
            setLocatingMsg(`📍 Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            setCustAddress(prev => prev ? `${prev} (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})` : `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          console.warn('Reverse geocoding error:', err);
          setLocatingMsg('GPS detected, please verify your address details.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocatingMsg('');
        setPayError('Could not fetch GPS location. Please enter your address manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ── Razorpay Payment Trigger & Execution ──────────────────────────────────
  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    if (!custName.trim()) return setPayError('Please enter your full name.');
    if (!custEmail.trim() || !custEmail.includes('@')) return setPayError('Please enter a valid email address.');
    if (!/^[6-9]\d{9}$/.test(custPhone.trim())) return setPayError('Please enter a valid 10-digit mobile number.');
    if (!custAddress.trim()) return setPayError('Please enter your complete delivery address.');
    if (!/^\d{6}$/.test(custPincode.trim())) return setPayError('Please enter a valid 6-digit delivery pincode.');
    if (!window.Razorpay) return setPayError('Razorpay payment gateway script not loaded. Please refresh the page.');

    setPayError('');
    setPayLoading(true);
    const orderId = `ORD-${Date.now().toString().slice(-8)}`;

    try {
      // Step 1: Create Razorpay Order on server
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          currency: 'INR',
          receipt: orderId,
          notes: {
            customerName: custName,
            phone: custPhone,
            email: custEmail,
            pincode: custPincode
          }
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error('Payment gateway service error. Please try again.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create payment order. Please try again.');
      }

      setPayLoading(false);

      // Step 2: Open Razorpay Payment Modal
      const fullAddress = `${custAddress.trim()}, PIN: ${custPincode.trim()}`;
      const orderPayload = {
        id: orderId,
        customerName: custName.trim(),
        customerPhone: custPhone.trim(),
        customerEmail: custEmail.trim(),
        customerAddress: fullAddress,
        pincode: custPincode.trim(),
        items: cartItems.map(i => ({
          id: i.id,
          name: i.name,
          selectedColor: i.selectedColor || null,
          selectedSize: i.selectedSize || null,
          price: i.price,
          quantity: i.quantity,
          image: i.image
        })),
        subtotal,
        discount: discountAmount,
        shipping: shippingCharge,
        total: grandTotal,
        status: 'Confirmed',
        paymentMethod: 'Online (Razorpay)'
      };

      const options = {
        key: data.keyId || 'rzp_test_TTxuY6jG2BTZS5',
        amount: data.amount,
        currency: data.currency,
        name: 'Sri Vastralaya',
        description: `Order #${orderId}`,
        order_id: data.orderId,
        prefill: {
          name: custName.trim(),
          contact: `+91${custPhone.trim()}`,
          email: custEmail.trim()
        },
        theme: { color: '#701A23' },
        modal: { backdropclose: false },
        handler: async (response) => {
          setPayLoading(true);
          try {
            const finalOrder = {
              ...orderPayload,
              paymentId: response.razorpay_payment_id,
              paymentMethod: `Razorpay (${response.razorpay_payment_id})`
            };

            // 1. Verify payment signature with backend
            await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: finalOrder
              })
            });

            // 2. Save order to Supabase
            try {
              await addOrder(finalOrder);
            } catch (err) {
              console.warn('Supabase addOrder warning:', err);
            }

            // 3. Save order to local user orders for instant history display
            try {
              const existing = JSON.parse(localStorage.getItem('sv_user_orders') || '[]');
              localStorage.setItem('sv_user_orders', JSON.stringify([finalOrder, ...existing]));
            } catch (e) {}

            setCompletedOrderData(finalOrder);
            setSuccessOrderId(orderId);
            clearCart();
            setCheckoutView('success');
          } catch (err) {
            setPayError(`Payment verification notice: ${err.message}`);
            setCheckoutView('form');
          } finally {
            setPayLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setPayError(`Payment failed: ${resp.error?.description || 'Transaction was declined.'}`);
        setPayLoading(false);
      });
      rzp.open();
    } catch (err) {
      setPayLoading(false);
      setPayError(err.message || 'Failed to initiate payment.');
    }
  };

  // ── Share on WhatsApp & Navigate to User Account Order History ────────────
  const handleConfirmAndWhatsApp = () => {
    const order = completedOrderData || {
      id: successOrderId,
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: custEmail,
      customerAddress: `${custAddress}, PIN: ${custPincode}`,
      total: grandTotal,
      items: cartItems
    };

    // Format clean, plain text WhatsApp message without stars or symbols
    let text = `NEW ORDER CONFIRMED - Sri Vastralaya\n\n`;
    text += `Order ID: #${order.id}\n`;
    if (order.paymentId) text += `Payment ID: ${order.paymentId} (Paid via Razorpay)\n`;
    text += `\nCustomer Details:\n`;
    text += `Name: ${order.customerName || custName}\n`;
    text += `Mobile: ${order.customerPhone || custPhone}\n`;
    text += `Email: ${order.customerEmail || custEmail}\n`;
    text += `Address: ${order.customerAddress || custAddress}\n`;
    text += `\nItems Ordered:\n`;

    const itemsToPrint = order.items && order.items.length > 0 ? order.items : cartItems;
    itemsToPrint.forEach((item, index) => {
      const colorTag = item.selectedColor ? ` (Color: ${item.selectedColor})` : '';
      const sizeTag = item.selectedSize ? ` (Size: ${item.selectedSize})` : '';
      text += `${index + 1}. ${item.name}${colorTag}${sizeTag} - Qty: ${item.quantity} x Rs.${item.price} = Rs.${item.price * item.quantity}\n`;
    });

    text += `\nTotal Amount Paid: Rs.${Number(order.total || grandTotal).toLocaleString('en-IN')}\n\n`;
    text += `Please dispatch my order soon. Thank you!`;

    // 1. Open WhatsApp
    window.open(`https://wa.me/919618093699?text=${encodeURIComponent(text)}`, '_blank');

    // 2. Close Cart Drawer
    setIsCartOpen(false);
    setCheckoutView('cart');

    // 3. Set Account tab to 'orders' and navigate
    localStorage.setItem('sv_account_initial_tab', 'orders');
    if (setActivePage) {
      setActivePage('account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={() => {
          setIsCartOpen(false);
          if (checkoutView === 'success') setCheckoutView('cart');
        }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col z-10 animate-slideLeft">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#701A23] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-serif font-bold text-lg text-white">
                {checkoutView === 'cart' && 'Your Shopping Cart'}
                {checkoutView === 'form' && 'Delivery Details'}
                {checkoutView === 'success' && 'Order Confirmed!'}
              </h3>
              {checkoutView === 'cart' && (
                <span className="bg-[#521117] text-[#D4AF37] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#891E2A]">
                  {cartItems.length} items
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                if (checkoutView === 'success') setCheckoutView('cart');
              }}
              className="p-1.5 text-gray-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── 1. ORDER CONFIRMED VIEW (SUCCESS) ─────────────────────────── */}
          {checkoutView === 'success' && (
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col justify-between space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 font-serif">
                    Order Confirmed!
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Your payment was successful and your order has been received.
                  </p>
                </div>

                {/* Order Summary Card */}
                <div className="bg-[#FAF0F1] border border-[#F5DCD0] rounded-2xl p-4 text-left space-y-2.5 shadow-2xs">
                  <div className="flex justify-between items-center border-b border-[#F5DCD0] pb-2">
                    <span className="text-xs text-gray-500 font-medium">Order ID</span>
                    <span className="text-sm font-bold text-[#701A23]">#{successOrderId}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Customer</span>
                    <span className="font-bold text-gray-800">{custName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-bold text-gray-800">+91 {custPhone}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500 block mb-0.5">Delivery Address</span>
                    <span className="font-semibold text-gray-800 block text-[11px] leading-tight">
                      {custAddress}, PIN: {custPincode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#F5DCD0] pt-2">
                    <span className="text-xs font-bold text-gray-700">Total Paid</span>
                    <span className="text-base font-extrabold text-[#701A23]">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: WhatsApp & Download Invoice & Account link */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmAndWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>OK — Share on WhatsApp & View Orders</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const orderToPrint = completedOrderData || {
                      id: successOrderId,
                      customerName: custName,
                      customerPhone: custPhone,
                      customerEmail: custEmail,
                      customerAddress: `${custAddress}, PIN: ${custPincode}`,
                      total: grandTotal,
                      subtotal,
                      discount: discountAmount,
                      shipping: shippingCharge,
                      items: cartItems
                    };
                    generateInvoice(orderToPrint);
                  }}
                  className="w-full bg-[#FAF0F1] hover:bg-[#F5DCD0] text-[#701A23] border border-[#F5DCD0] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official Tax Invoice (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutView('cart');
                    if (setActivePage) setActivePage('account');
                  }}
                  className="w-full text-center text-xs text-gray-500 hover:text-[#701A23] font-semibold py-1.5 cursor-pointer"
                >
                  Go to My Account / Order History →
                </button>
              </div>
            </div>
          )}

          {/* ── 2. DELIVERY DETAILS FORM VIEW ────────────────────────────── */}
          {checkoutView === 'form' && (
            <div className="flex-1 overflow-y-auto">
              {/* Top summary banner */}
              <div className="bg-[#FAF0F1] px-5 py-3 border-b border-[#F5DCD0] flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700">
                  {cartItems.length} items · {isFreeShipping ? 'Free Delivery' : `₹${standardShippingFee} Delivery`}
                </span>
                <span className="font-extrabold text-[#701A23] text-sm">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <form onSubmit={handleRazorpayPayment} className="p-5 space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="e.g. Neela Akhil"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-[#701A23] focus:ring-2 focus:ring-[#701A23]/10"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      placeholder="e.g. akhil@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-[#701A23] focus:ring-2 focus:ring-[#701A23]/10"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <span className="absolute left-9 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full pl-16 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-[#701A23] focus:ring-2 focus:ring-[#701A23]/10"
                    />
                  </div>
                </div>

                {/* Delivery Address with Locate Me */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Delivery Address *
                    </label>
                    <button
                      type="button"
                      onClick={handleLocateMe}
                      disabled={locating}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#701A23] bg-[#701A23]/10 hover:bg-[#701A23]/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      {locating ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <Navigation className="w-3 h-3 text-[#701A23]" />
                      )}
                      <span>{locating ? 'Locating...' : '📍 Locate Me'}</span>
                    </button>
                  </div>

                  {locatingMsg && (
                    <p className="text-[10px] text-emerald-700 font-semibold mb-1 truncate bg-emerald-50 px-2 py-0.5 rounded">
                      {locatingMsg}
                    </p>
                  )}

                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      required
                      rows={3}
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      placeholder="House/Flat No., Building, Street, Area, Landmark"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-[#701A23] focus:ring-2 focus:ring-[#701A23]/10 resize-none"
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={custPincode}
                    onChange={(e) => setCustPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 500001"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-[#701A23] focus:ring-2 focus:ring-[#701A23]/10"
                  />
                </div>

                {payError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-700 font-medium">
                    {payError}
                  </div>
                )}

                {/* Summary Box */}
                <div className="bg-gray-50 rounded-xl p-3.5 space-y-1 text-xs text-gray-600 border border-gray-200">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount (SRI10):</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span className="font-semibold text-gray-800">
                      {isFreeShipping ? <strong className="text-emerald-600">FREE</strong> : `₹${standardShippingFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-gray-900 pt-1.5 border-t border-gray-200">
                    <span>Total Amount:</span>
                    <span className="text-[#701A23] text-base font-extrabold">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Submit to Open Razorpay */}
                <button
                  type="submit"
                  disabled={payLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#701A23] hover:bg-[#521117] text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-60"
                >
                  {payLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Proceed to Pay · ₹{grandTotal.toLocaleString('en-IN')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-gray-400">
                  🔒 100% Secure Checkout via Razorpay · UPI · Cards · Netbanking
                </p>

                <button
                  type="button"
                  onClick={() => setCheckoutView('cart')}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-800 transition-colors py-1 cursor-pointer"
                >
                  ← Back to cart items
                </button>
              </form>
            </div>
          )}

          {/* ── 3. STANDARD CART ITEMS VIEW ─────────────────────────────── */}
          {checkoutView === 'cart' && (
            <>
              {/* Free Shipping Progress (only if enableFreeShipping is ON) */}
              {enableFreeShipping && standardShippingFee > 0 && (
                <div className="bg-[#FAF0F1] p-3 px-5 border-b border-[#F5DCD0] text-xs text-[#701A23]">
                  {isFreeShipping ? (
                    <div className="flex items-center gap-2 font-bold text-emerald-700">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>🎉 You qualify for FREE Shipping!</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-medium">
                        <span>Add <strong>₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more for FREE shipping</span>
                        <span>₹{subtotal}/₹{freeShippingThreshold}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#701A23] h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (subtotal / (freeShippingThreshold || 2000)) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* All orders Free Delivery banner if standard fee is 0 */}
              {standardShippingFee === 0 && (
                <div className="bg-emerald-50 p-2.5 px-5 border-b border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>🎉 100% Free Delivery on all orders!</span>
                </div>
              )}

              {/* Cart Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <h4 className="font-serif text-xl font-bold text-gray-800">Your cart is empty</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      Explore our sarees, jewellery, dresses, shirts &amp; photo frames collection!
                    </p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        if (setActivePage) setActivePage('products');
                      }}
                      className="bg-[#701A23] hover:bg-[#521117] text-white px-6 py-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
                    >
                      <span>Explore Products</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.itemKey} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 relative group">
                        <div className="w-20 h-24 rounded-lg bg-white border border-gray-200 shrink-0 p-1 flex items-center justify-center overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start pr-6">
                              <h4 className="font-serif text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">{item.subcategory || item.category}</span>
                              {item.selectedColor && (
                                <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                                  Color: {item.selectedColor}
                                </span>
                              )}
                              {item.selectedSize && (
                                <span className="text-[10px] bg-[#701A23]/10 text-[#701A23] font-extrabold px-1.5 py-0.5 rounded">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-bold text-[#701A23] mt-1">₹{item.price.toLocaleString('en-IN')}</div>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden">
                              <button onClick={() => updateQuantity(item.itemKey, item.quantity - 1)} className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 text-xs font-bold cursor-pointer">-</button>
                              <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.itemKey, item.quantity + 1)} className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 text-xs font-bold cursor-pointer">+</button>
                            </div>
                            <span className="font-bold text-xs text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.itemKey)} className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-500 p-1 cursor-pointer" title="Remove item">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="text-right pt-1">
                      <button onClick={clearCart} className="text-[11px] text-gray-500 hover:text-red-600 underline cursor-pointer">Clear Cart</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cartItems.length > 0 && (
                <div className="p-4 sm:p-5 bg-white border-t border-gray-100 space-y-3">
                  {/* Price Breakdown */}
                  <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {couponApplied && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount (10%):</span>
                        <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Charge:</span>
                      <span className="font-semibold">
                        {isFreeShipping ? <strong className="text-emerald-600">FREE</strong> : `₹${standardShippingFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total Amount:</span>
                      <span className="text-[#701A23] text-lg font-extrabold">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Proceed to Pay Button */}
                  <button
                    onClick={handleOpenCheckoutForm}
                    className="w-full flex items-center justify-center gap-2 bg-[#701A23] hover:bg-[#521117] text-white py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Pay · ₹{grandTotal.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#701A23]" /> Fast Shipping
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Secure Razorpay
                    </span>
                  </div>

                  <p className="text-center text-[10px] text-gray-400">
                    🔒 UPI · Google Pay · PhonePe · Cards · Netbanking
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
