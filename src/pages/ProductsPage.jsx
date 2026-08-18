import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, RefreshCw, ShoppingBag, Loader2 } from 'lucide-react';
import { products as initialProducts } from '../data/products';
import { categories as initialCategories } from '../data/categories';
import { getProducts, getCategories } from '../services/supabase';
import ProductCard from '../components/ProductCard';

export default function ProductsPage({ selectedCategory, setSelectedCategory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [productsList, setProductsList] = useState(initialProducts);
  const [categoriesList, setCategoriesList] = useState(initialCategories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
        if (prods && prods.length > 0) setProductsList(prods);
        if (cats && cats.length > 0) setCategoriesList(cats);
      } catch (err) {
        console.warn('Could not load live store products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('sv_products_updated', handleSync);
    return () => window.removeEventListener('sv_products_updated', handleSync);
  }, []);

  const categoryList = [
    { id: 'all', name: 'All Products' },
    ...categoriesList.map(c => ({ id: c.id, name: c.name }))
  ];

  const filteredProducts = useMemo(() => {
    return productsList.filter(product => {
      // Category filter
      if (selectedCategory && selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchCat = product.category.toLowerCase().includes(query);
        const matchSub = product.subcategory.toLowerCase().includes(query);
        if (!matchName && !matchCat && !matchSub) return false;
      }
      // Price filter
      if (product.price > maxPrice) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default featured
    });
  }, [selectedCategory, searchQuery, sortBy, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-100 pb-6" data-aos="fade-down">
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">Explore Our Catalog</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
          Sri Vastralaya Fashion Collection
        </h1>
        <p className="text-gray-600 text-sm mt-1 max-w-2xl">
          Browse sarees, dresses, jewellery, hair accessories & fashion items curated for quality, elegance, and affordable pricing.
        </p>
      </div>

      {/* Filter & Controls Bar */}
      <div className="space-y-4" data-aos="fade-up">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoryList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                (selectedCategory === cat.id || (!selectedCategory && cat.id === 'all'))
                  ? 'bg-[#701A23] text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search, Sort, and Price Filter Grid */}
        <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#701A23]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#701A23]" />
              <label className="text-xs font-semibold text-gray-700">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white text-xs font-semibold text-gray-800 py-2 px-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#701A23]"
              >
                <option value="featured">Featured / Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(selectedCategory !== 'all' || searchQuery !== '' || sortBy !== 'featured') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSortBy('featured');
                  setMaxPrice(2500);
                }}
                className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Counter */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>Showing <strong>{filteredProducts.length}</strong> of {productsList.length} items</span>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 space-y-4">
          <div className="w-16 h-16 bg-[#FAF0F1] rounded-full flex items-center justify-center mx-auto text-[#701A23]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-gray-900">No products found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try resetting your search query or selecting a different category filter above.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="bg-[#701A23] text-white px-5 py-2 rounded-xl text-xs font-bold"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
