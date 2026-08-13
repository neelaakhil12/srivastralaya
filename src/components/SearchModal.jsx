import React, { useState } from 'react';
import { Search, X, ShoppingBag } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { products } from '../data/products';

export default function SearchModal({ setActivePage, onProductSelect }) {
  const { isSearchOpen, setIsSearchOpen, openQuickView } = useUI();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filtered = query.trim() === ''
    ? []
    : products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.subcategory.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Dark Backdrop */}
      <div
        onClick={() => setIsSearchOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white w-full max-w-2xl mx-auto rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 animate-slideDown">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#701A23]" />
          <input
            type="text"
            autoFocus
            placeholder="Search sarees, jewellery, hair accessories, dresses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm sm:text-base outline-none text-gray-900 placeholder:text-gray-400"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4">
          {query.trim() === '' ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Popular Searches</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['Silk Saree', 'Khadi Cotton Saree', 'Scrunchies', 'Temple Jewellery', 'Dresses', 'Hair Pins'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="bg-gray-100 hover:bg-[#FAF0F1] hover:text-[#701A23] text-gray-700 text-xs px-3 py-1.5 rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No products found matching "<strong>{query}</strong>". Try searching for "Saree", "Jewellery", or "Cotton".
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-semibold mb-2">Found {filtered.length} products:</p>
              {filtered.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setIsSearchOpen(false);
                    openQuickView(product);
                  }}
                  className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                >
                  <img src={product.image} alt={product.name} className="w-12 h-14 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h5 className="font-serif font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</h5>
                    <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider block">
                      {product.subcategory || product.category}
                    </span>
                    <span className="text-xs font-bold text-[#701A23]">₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
