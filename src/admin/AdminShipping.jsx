import React, { useState, useEffect } from 'react';
import { Truck, Check, Save, Sparkles, ShieldCheck, AlertCircle, RefreshCw, Banknote } from 'lucide-react';
import { getShippingSettings, saveShippingSettings } from '../context/CartContext';

export default function AdminShipping() {
  const [standardFee, setStandardFee] = useState(99);
  const [freeThreshold, setFreeThreshold] = useState(2000);
  const [enableFreeShipping, setEnableFreeShipping] = useState(true);
  const [enableCOD, setEnableCOD] = useState(true);
  const [deliveryNote, setDeliveryNote] = useState('Fast Shipping Across India');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const settings = getShippingSettings();
    setStandardFee(settings.standardShippingFee ?? 99);
    setFreeThreshold(settings.freeShippingThreshold ?? 2000);
    setEnableFreeShipping(settings.enableFreeShipping ?? true);
    setEnableCOD(settings.enableCOD !== false);
    setDeliveryNote(settings.deliveryNote || 'Fast Shipping Across India');
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const newSettings = {
      standardShippingFee: Math.max(0, Number(standardFee) || 0),
      freeShippingThreshold: Math.max(0, Number(freeThreshold) || 0),
      enableFreeShipping: Boolean(enableFreeShipping),
      enableCOD: Boolean(enableCOD),
      deliveryNote: deliveryNote.trim() || 'Fast Shipping Across India'
    };

    saveShippingSettings(newSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Reset shipping & payment settings to defaults (₹99 delivery, free above ₹2000, COD enabled)?')) return;
    setStandardFee(99);
    setFreeThreshold(2000);
    setEnableFreeShipping(true);
    setEnableCOD(true);
    setDeliveryNote('Fast Shipping Across India');
    saveShippingSettings({
      standardShippingFee: 99,
      freeShippingThreshold: 2000,
      enableFreeShipping: true,
      enableCOD: true,
      deliveryNote: 'Fast Shipping Across India'
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF0F1] flex items-center justify-center text-[#701A23]">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
              Shipping &amp; Delivery Settings
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure store-wide shipping fees, free delivery rules, and estimated delivery guarantees
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-sm font-bold animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Shipping settings updated successfully! Live across store and checkout immediately.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form (2 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#701A23]" />
            <span>Store Delivery Rates</span>
          </h2>

          {/* Standard Shipping Fee */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Standard Shipping Charge (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-gray-500">
                ₹
              </span>
              <input
                type="number"
                min="0"
                required
                value={standardFee}
                onChange={(e) => setStandardFee(e.target.value)}
                placeholder="99"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Applied automatically to all orders below the free shipping threshold. (Set <strong>0</strong> for 100% Free Shipping on everything).
            </p>
          </div>

          {/* Free Shipping Rule */}
          <div className="p-4 bg-[#FAF0F1]/60 border border-[#F5DCD0] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900">
                  Enable Free Delivery Over Order Threshold
                </span>
                <p className="text-[11px] text-gray-500">
                  Offer free delivery to reward larger customer purchases.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableFreeShipping}
                  onChange={(e) => setEnableFreeShipping(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#701A23]"></div>
              </label>
            </div>

            {enableFreeShipping && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Minimum Order Value for Free Delivery (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={freeThreshold}
                    onChange={(e) => setFreeThreshold(e.target.value)}
                    placeholder="2000"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#701A23] focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Orders equal to or greater than <strong>₹{Number(freeThreshold || 0).toLocaleString('en-IN')}</strong> will get free delivery automatically.
                </p>
              </div>
            )}
          </div>

          {/* Cash on Delivery (COD) Option Toggle */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    Enable Cash on Delivery (COD) in Payment Form
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  When turned ON, customers will see Cash on Delivery option in the checkout form. When turned OFF, Cash on Delivery is completely removed from the checkout form.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={enableCOD}
                  onChange={(e) => setEnableCOD(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className={`text-[11px] font-bold px-3 py-1.5 rounded-xl inline-flex items-center gap-2 border transition-all ${
              enableCOD
                ? 'bg-emerald-100/80 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${enableCOD ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'}`} />
              <span>
                {enableCOD
                  ? 'Active: Customers can choose Cash on Delivery during checkout'
                  : 'Disabled: Cash on Delivery option is hidden from checkout form'}
              </span>
            </div>
          </div>

          {/* Delivery Tagline / Micro-copy */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Checkout Shipping Guarantee Message
            </label>
            <input
              type="text"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="Fast Shipping Across India"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Displayed under the checkout button and product modal guarantees.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#701A23] hover:bg-[#521117] text-white py-3 px-6 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Apply Shipping Charges</span>
            </button>
          </div>
        </form>

        {/* Live Customer Preview Card (1 col) */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 pb-2 border-b border-gray-100">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Live Checkout Preview</span>
            </h3>

            {/* Simulated Cart Total */}
            <div className="p-3.5 bg-gray-50 rounded-2xl space-y-2 text-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Example Order Breakdown</p>
              <div className="flex justify-between text-gray-600">
                <span>Sample Item (e.g. Saree):</span>
                <span>₹799</span>
              </div>
              <div className="flex justify-between items-center text-gray-700 font-semibold">
                <span>Delivery Charge:</span>
                <span className={Number(standardFee) === 0 ? 'text-emerald-600 font-bold' : 'text-gray-900 font-bold'}>
                  {Number(standardFee) === 0 ? 'FREE' : `₹${standardFee}`}
                </span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-gray-900 pt-2 border-t border-gray-200">
                <span>Customer Total:</span>
                <span className="text-[#701A23]">₹{(799 + (Number(standardFee) || 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Free Shipping Banner Preview */}
            {enableFreeShipping && Number(freeThreshold) > 0 && (
              <div className="p-3.5 bg-[#FAF0F1] border border-[#F5DCD0] rounded-2xl text-xs space-y-1.5 text-[#701A23]">
                <div className="flex justify-between font-bold">
                  <span>Add ₹{Math.max(0, Number(freeThreshold) - 799)} more for FREE shipping</span>
                  <span>₹799 / ₹{freeThreshold}</span>
                </div>
                <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#F5DCD0]">
                  <div
                    className="bg-[#701A23] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (799 / Number(freeThreshold)) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Payment Methods Preview */}
            <div className="p-3.5 bg-gray-50 rounded-2xl space-y-2 text-xs border border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Payment Methods in Checkout</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    💳 Online (UPI / Cards / Netbanking)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Always Active
                  </span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-xl border ${
                  enableCOD
                    ? 'bg-white border-emerald-300'
                    : 'bg-gray-100/60 border-dashed border-gray-300 opacity-60'
                }`}>
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    💵 Cash on Delivery (COD)
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    enableCOD ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {enableCOD ? 'Visible in Form' : 'Hidden from Form'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{deliveryNote}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
