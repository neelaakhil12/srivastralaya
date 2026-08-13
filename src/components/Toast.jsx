import React from 'react';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 right-6 z-50 bg-[#701A23] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#D4AF37] flex items-center gap-3 animate-slideLeft">
      <div className="w-8 h-8 rounded-full bg-[#521117] flex items-center justify-center text-[#D4AF37]">
        <CheckCircle className="w-5 h-5" />
      </div>
      <p className="text-xs sm:text-sm font-semibold pr-2">{toastMessage}</p>
    </div>
  );
}
