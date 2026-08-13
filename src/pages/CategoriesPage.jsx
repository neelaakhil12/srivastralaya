import React from 'react';
import { categories } from '../data/categories';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CategoriesPage({ setActivePage, onCategorySelect }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3" data-aos="fade-down">
        <div className="inline-flex items-center gap-2 bg-[#FAF0F1] text-[#701A23] border border-[#F5DCD0] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>Browse By Collections</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
          Our Product Categories
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          From traditional silk & cotton sarees to fine jewellery, trendy hair accessories, modern clothing, photoframes, and fancy lifestyle gifts. Explore everything Sri Vastralaya has to offer!
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            data-aos="fade-up"
            data-aos-delay={index * 50}
            onClick={() => {
              if (onCategorySelect) onCategorySelect(cat.id);
              setActivePage('products');
            }}
            className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            {/* Category Image */}
            <div className="relative aspect-[4/5] sm:aspect-4/3 overflow-hidden bg-[#FAF8F5]">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-2"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute top-3 right-3 bg-[#701A23] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                {cat.itemCount}
              </span>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-gray-900 group-hover:text-[#701A23] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Subcategories list */}
              {cat.subcategories && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                  {cat.subcategories.map((sub, i) => (
                    <span
                      key={i}
                      className="bg-[#FAF8F5] text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-gray-200"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <button className="w-full bg-[#701A23] hover:bg-[#521117] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs">
                  <span>Browse {cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
