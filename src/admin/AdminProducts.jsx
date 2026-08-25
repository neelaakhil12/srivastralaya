import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Loader2,
  Search,
  AlertCircle
} from 'lucide-react';
import { getProducts, getCategories, addProduct, updateProduct, deleteProduct } from '../services/supabase';
import { uploadToCloudinary } from '../services/cloudinary';

const POPULAR_COLORS = [
  { name: 'Red', hex: '#E53E3E' },
  { name: 'Black', hex: '#1A202C' },
  { name: 'Maroon', hex: '#701A23' },
  { name: 'Royal Blue', hex: '#2B6CB0' },
  { name: 'Bottle Green', hex: '#22543D' },
  { name: 'Yellow / Gold', hex: '#D69E2E' },
  { name: 'Pink', hex: '#ED64A6' },
  { name: 'White / Cream', hex: '#FAF5EE' },
  { name: 'Navy Blue', hex: '#1A365D' },
  { name: 'Peacock Teal', hex: '#2C7A7B' },
  { name: 'Orange / Rust', hex: '#DD6B20' },
  { name: 'Purple / Violet', hex: '#6B46C1' }
];

export default function AdminProducts({ isAddingNew, onCloseNewModal }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingColorName, setUploadingColorName] = useState(null);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#701A23');
  const [modalError, setModalError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'dresses',
    price: '',
    oldPrice: '',
    discount: '',
    isNew: true,
    isFeatured: true,
    isBestSeller: false,
    isTrending: false,
    rating: 4.9,
    reviewsCount: 15,
    image: '',
    images: [],
    description: '',
    specifications: '',
    inStock: true,
    hasSizes: false,
    sizes: [],
    sizePrices: {},
    hasColors: false,
    colors: []
  });
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [showAllSizeTypes, setShowAllSizeTypes] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isAddingNew) {
      handleOpenCreate();
      if (onCloseNewModal) onCloseNewModal();
    }
  }, [isAddingNew]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
    } catch (err) {
      console.error('Failed to load products/categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (newCat) => {
    const catLower = (newCat || '').toLowerCase();
    const isFrame = catLower.includes('photo') || catLower.includes('frame');
    const isShirt = catLower.includes('shirt') && !catLower.includes('t-shirt') && !catLower.includes('tshirt');
    const isTShirt = catLower.includes('t-shirt') || catLower.includes('tshirt');
    const apparelCategories = ['dress', 'shirt', 'kurti', 'menswear', 'men', 'kids', 'western', 'lehenga', 'pant', 'bottom', 'top', 't-shirt'];
    const isApparel = apparelCategories.some(c => catLower.includes(c));
    const shouldHaveSize = isFrame || isApparel;

    setShowAllSizeTypes(false);

    setFormData(prev => {
      let defaultSizes = [];
      let defaultSizePrices = {};

      if (isFrame) {
        defaultSizes = ['A3', 'A4', 'A5', 'A6'];
        defaultSizePrices = { 'A6': 199, 'A5': 299, 'A4': 499, 'A3': 799 };
      } else if (isShirt) {
        defaultSizes = ['M', 'L', 'XL', 'XXL'];
      } else if (isTShirt || isApparel) {
        defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      }

      return {
        ...prev,
        category: newCat,
        hasSizes: shouldHaveSize,
        sizes: shouldHaveSize ? defaultSizes : [],
        sizePrices: shouldHaveSize ? defaultSizePrices : {}
      };
    });
  };

  const handleToggleSize = (sizeStr) => {
    setFormData(prev => {
      const exists = prev.sizes.includes(sizeStr);
      const updated = exists ? prev.sizes.filter(s => s !== sizeStr) : [...prev.sizes, sizeStr];
      const updatedPrices = { ...(prev.sizePrices || {}) };
      if (exists) {
        delete updatedPrices[sizeStr];
      }
      return {
        ...prev,
        hasSizes: true,
        sizes: updated,
        sizePrices: updatedPrices
      };
    });
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    if (!formData.sizes.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        hasSizes: true,
        sizes: [...prev.sizes, trimmed]
      }));
    }
    setCustomSizeInput('');
  };

  const handleRemoveSize = (sizeStr) => {
    setFormData(prev => {
      const updatedPrices = { ...(prev.sizePrices || {}) };
      delete updatedPrices[sizeStr];
      return {
        ...prev,
        sizes: prev.sizes.filter(s => s !== sizeStr),
        sizePrices: updatedPrices
      };
    });
  };

  const handleToggleColor = (colorPreset) => {
    setFormData(prev => {
      const exists = (prev.colors || []).some(c => c.name.toLowerCase() === colorPreset.name.toLowerCase());
      const updated = exists
        ? prev.colors.filter(c => c.name.toLowerCase() !== colorPreset.name.toLowerCase())
        : [...(prev.colors || []), { name: colorPreset.name, hex: colorPreset.hex, image: '' }];
      return {
        ...prev,
        hasColors: true,
        colors: updated
      };
    });
  };

  const handleAddCustomColor = () => {
    const trimmed = customColorName.trim();
    if (!trimmed) return;
    setFormData(prev => {
      const exists = (prev.colors || []).some(c => c.name.toLowerCase() === trimmed.toLowerCase());
      if (exists) return prev;
      return {
        ...prev,
        hasColors: true,
        colors: [...(prev.colors || []), { name: trimmed, hex: customColorHex, image: '' }]
      };
    });
    setCustomColorName('');
  };

  const handleRemoveColor = (colorName) => {
    setFormData(prev => ({
      ...prev,
      colors: (prev.colors || []).filter(c => c.name !== colorName)
    }));
  };

  const handleColorImageUpload = async (colorName, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingColorName(colorName);
    setModalError('');
    try {
      const cloudinaryUrl = await uploadToCloudinary(file, 'sri-vastralaya/products');
      setFormData(prev => ({
        ...prev,
        colors: (prev.colors || []).map(c => c.name === colorName ? { ...c, image: cloudinaryUrl } : c),
        image: prev.image || cloudinaryUrl,
        images: prev.images && prev.images.length > 0 ? prev.images : [cloudinaryUrl]
      }));
    } catch (err) {
      setModalError(`Failed to upload ${colorName} image: ` + err.message);
    } finally {
      setUploadingColorName(null);
    }
  };

  const handleOpenCreate = () => {
    const defaultCat = categories[0]?.id || 'dresses';
    const catLower = defaultCat.toLowerCase();
    const isFrame = catLower.includes('photo') || catLower.includes('frame');
    const isApparel = ['dress', 'shirt', 'kurti', 'menswear', 'men', 'kids', 'western', 't-shirt'].some(c => catLower.includes(c));
    const shouldHaveSize = isFrame || isApparel;

    setShowAllSizeTypes(false);
    setEditingProduct(null);
    setFormData({
      id: '',
      name: '',
      category: defaultCat,
      price: '',
      oldPrice: '',
      discount: '',
      isNew: true,
      isFeatured: false,
      isBestSeller: false,
      isTrending: false,
      rating: 4.8,
      reviewsCount: 12,
      image: '',
      images: [],
      description: '',
      specifications: isFrame
        ? '• Synthetic Wood Premium Matte Frame\n• High Clarity Acrylic Glass\n• Wall Mount & Table Stand Included\n• Fade-Proof High-Definition Print'
        : '• 100% Premium Quality Fabric\n• Elegant Traditional Weave\n• Comfortable & Breathable Fit\n• Dry Clean or Gentle Hand Wash Recommended',
      inStock: true,
      hasSizes: shouldHaveSize,
      sizes: isFrame ? ['A3', 'A4', 'A5', 'A6'] : (isApparel ? ['S', 'M', 'L', 'XL', 'XXL'] : []),
      sizePrices: isFrame ? { 'A6': 199, 'A5': 299, 'A4': 499, 'A3': 799 } : {},
      hasColors: false,
      colors: []
    });
    setCustomSizeInput('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    const prodHasSizes = Boolean(prod.sizes && Array.isArray(prod.sizes) && prod.sizes.length > 0);
    const prodHasColors = Boolean(prod.colors && Array.isArray(prod.colors) && prod.colors.length > 0);
    const parsedSpecs = Array.isArray(prod.specifications) && prod.specifications.length > 0
      ? prod.specifications.map(s => s.startsWith('•') ? s : `• ${s}`).join('\n')
      : (typeof prod.specifications === 'string' && prod.specifications.trim()
        ? prod.specifications
        : ([prod.fabric ? `• Fabric: ${prod.fabric}` : '', prod.length ? `• Dimensions: ${prod.length}` : '', prod.subcategory ? `• Type: ${prod.subcategory}` : ''].filter(Boolean).join('\n')));

    setEditingProduct(prod);
    setFormData({
      id: prod.id,
      name: prod.name,
      category: prod.category || 'dresses',
      price: prod.price || '',
      oldPrice: prod.oldPrice || '',
      discount: prod.discount || '',
      isNew: prod.isNew ?? false,
      isFeatured: prod.isFeatured ?? false,
      isBestSeller: prod.isBestSeller ?? false,
      isTrending: prod.isTrending ?? false,
      rating: prod.rating || 4.8,
      reviewsCount: prod.reviewsCount || 0,
      image: prod.image || '',
      images: Array.isArray(prod.images) ? [...prod.images] : (prod.image ? [prod.image] : []),
      description: prod.description || '',
      specifications: parsedSpecs,
      inStock: prod.inStock ?? true,
      hasSizes: prodHasSizes,
      sizes: Array.isArray(prod.sizes) ? [...prod.sizes] : [],
      sizePrices: (prod.sizePrices && typeof prod.sizePrices === 'object') ? { ...prod.sizePrices } : {},
      hasColors: prodHasColors,
      colors: Array.isArray(prod.colors) ? [...prod.colors] : []
    });
    setCustomSizeInput('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handlePriceChange = (priceVal, oldPriceVal) => {
    const p = Number(priceVal);
    const op = Number(oldPriceVal);
    let discountStr = '';

    if (p && op && op > p) {
      const pct = Math.round(((op - p) / op) * 100);
      discountStr = `${pct}% OFF`;
    }

    setFormData(prev => ({
      ...prev,
      price: priceVal,
      oldPrice: oldPriceVal,
      discount: discountStr
    }));
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setModalError('');
    try {
      const cloudinaryUrl = await uploadToCloudinary(file, 'sri-vastralaya/products');
      setFormData(prev => ({
        ...prev,
        image: cloudinaryUrl,
        images: prev.images.length > 0 ? [cloudinaryUrl, ...prev.images.slice(1)] : [cloudinaryUrl]
      }));
    } catch (err) {
      setModalError('Failed to upload image to Cloudinary: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setModalError('');
    try {
      const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file, 'sri-vastralaya/products'));
      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (err) {
      setModalError('Failed to upload gallery images to Cloudinary: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleToggleStock = async (prod) => {
    try {
      const updated = !prod.inStock;
      await updateProduct(prod.id, { ...prod, inStock: updated });
      setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, inStock: updated } : p));
    } catch (err) {
      alert('Failed to update stock: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim()) {
      setModalError('Product title is required');
      return;
    }

    let calculatedPrice = Number(formData.price) || 0;
    if (formData.hasSizes && formData.sizes && formData.sizes.length > 0) {
      const validSizePrices = formData.sizes
        .map(s => formData.sizePrices?.[s])
        .filter(p => p !== undefined && p !== null && p !== '' && Number(p) > 0)
        .map(Number);
      if (validSizePrices.length > 0) {
        calculatedPrice = validSizePrices[0];
      }
    }

    if (!calculatedPrice && !formData.hasSizes) {
      setModalError('Product price is required');
      return;
    }

    if (!formData.image) {
      setModalError('Please upload at least one product image to Cloudinary');
      return;
    }

    setSubmitting(true);
    try {
      const generatedId = formData.id.trim() || `sv-${formData.category.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
      
      // Clean sizePrices so only active sizes are kept and empty values removed
      const cleanedSizePrices = {};
      if (formData.hasSizes && formData.sizes && formData.sizes.length > 0 && formData.sizePrices) {
        formData.sizes.forEach(s => {
          if (formData.sizePrices[s] !== undefined && formData.sizePrices[s] !== '' && formData.sizePrices[s] !== null) {
            cleanedSizePrices[s] = Number(formData.sizePrices[s]);
          }
        });
      }

      const specLines = typeof formData.specifications === 'string'
        ? formData.specifications.split('\n').map(s => s.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean)
        : (Array.isArray(formData.specifications) ? formData.specifications : []);

      const payload = {
        ...formData,
        id: generatedId,
        price: calculatedPrice,
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
        sizes: formData.hasSizes && formData.sizes.length > 0 ? formData.sizes : null,
        sizePrices: Object.keys(cleanedSizePrices).length > 0 ? cleanedSizePrices : null,
        colors: formData.hasColors && formData.colors && formData.colors.length > 0 ? formData.colors : null,
        specifications: specLines.length > 0 ? specLines : null,
        images: formData.images.length > 0 ? formData.images : [formData.image]
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      setModalError('Error saving product to Supabase: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      alert('Failed to delete product: ' + err.message);
    }
  };

  // Filter products
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (prod.subcategory && prod.subcategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (prod.id && prod.id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategoryFilter === 'all' || prod.category === selectedCategoryFilter;
    const matchesStock = stockFilter === 'all' ? true : stockFilter === 'inStock' ? prod.inStock : !prod.inStock;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#701A23]" />
              <span>Products Management</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Add, update prices, manage stock levels, and upload images to Cloudinary
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#701A23] hover:bg-[#521117] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, subcategory or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#701A23]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#701A23]"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#701A23]"
            >
              <option value="all">All Stock Status</option>
              <option value="inStock">In Stock Only</option>
              <option value="outOfStock">Out of Stock Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#701A23] mb-2" />
            <p className="text-xs font-medium">Loading products from Supabase...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-bold text-gray-700">No products found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or click "Add New Product".</p>
          </div>
        ) : (
          <>
            {/* Mobile Products Grid / Cards View (Visible on small screens) */}
            <div className="block md:hidden divide-y divide-gray-100">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="p-4 space-y-3 hover:bg-gray-50/60 transition-colors">
                  <div className="flex gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0 bg-gray-100"
                      onError={(e) => { e.currentTarget.src = '/products/saree-placeholder.png'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-bold text-gray-900 text-xs truncate" title={prod.name}>
                          {prod.name}
                        </p>
                        <span className="font-extrabold text-xs text-[#701A23] shrink-0">
                          ₹{prod.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        ID: {prod.id}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-semibold capitalize">
                          {prod.category}
                        </span>
                        {prod.subcategory && (
                          <span className="text-[10px] text-gray-500 font-medium">
                            • {prod.subcategory}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* Stock Switch */}
                    <button
                      onClick={() => handleToggleStock(prod)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                        prod.inStock
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${prod.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span>{prod.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    </button>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-gray-700 bg-gray-100 hover:bg-[#FAF0F1] hover:text-[#701A23] rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(prod.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF0F1]/50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price / Discount</th>
                    <th className="py-3 px-4 text-center">Stock</th>
                    <th className="py-3 px-4 text-center">Badges</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Image & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0 bg-gray-100"
                            onError={(e) => { e.currentTarget.src = '/products/saree-placeholder.png'; }}
                          />
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <p className="font-bold text-gray-900 truncate" title={prod.name}>
                              {prod.name}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono">
                              ID: {prod.id} {prod.subcategory && `• ${prod.subcategory}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-semibold text-gray-700 capitalize">
                        <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-[11px]">
                          {prod.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#701A23]">
                            ₹{prod.price?.toLocaleString('en-IN')}
                          </span>
                          {prod.oldPrice && (
                            <span className="text-gray-400 line-through text-[11px]">
                              ₹{prod.oldPrice?.toLocaleString('en-IN')}
                            </span>
                          )}
                          {prod.discount && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {prod.discount}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStock(prod)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                            prod.inStock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${prod.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span>{prod.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        </button>
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {prod.isBestSeller && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Best Seller
                            </span>
                          )}
                          {prod.isTrending && (
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Trending
                            </span>
                          )}
                          {prod.isFeatured && (
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                          {prod.isNew && (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              New
                            </span>
                          )}
                          {!prod.isBestSeller && !prod.isTrending && !prod.isFeatured && !prod.isNew && (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 text-gray-600 hover:text-[#701A23] hover:bg-[#FAF0F1] rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(prod.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative animate-fadeIn border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden my-auto">
            {/* Pinned Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5 border-b border-gray-100 bg-white shrink-0">
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900">
                  {editingProduct ? 'Edit Product Details' : 'Add New Product'}
                </h3>
                <p className="text-xs text-gray-500">
                  Media will be hosted on Cloudinary & saved to Supabase
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form with Scrollable Content */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4 sm:px-8 sm:py-5 space-y-4 text-xs">
                {modalError && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Product Title */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Royal Maroon Silk Cotton Saree with Zari Border"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price, Old Price & Discount (Hidden when size-specific pricing is enabled) */}
                {!formData.hasSizes && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        required={!formData.hasSizes}
                        value={formData.price}
                        onChange={(e) => handlePriceChange(e.target.value, formData.oldPrice)}
                        placeholder="899"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#701A23] focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Original MRP (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.oldPrice}
                        onChange={(e) => handlePriceChange(formData.price, e.target.value)}
                        placeholder="1599"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Discount Badge
                      </label>
                      <input
                        type="text"
                        value={formData.discount}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                        placeholder="Auto or 43% OFF"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-emerald-700 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Cloudinary Main Image Upload */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Primary Product Image (Cloudinary) *
                  </label>
                  
                  {formData.image ? (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                      <img
                        src={formData.image}
                        alt="Primary"
                        className="w-20 h-20 object-cover rounded-xl border border-gray-200 bg-white shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">Cloudinary Image Ready</p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{formData.image}</p>
                        <label className="mt-2 inline-block px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[11px] font-bold rounded-lg cursor-pointer">
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMainImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 hover:border-[#701A23] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-[#FAF0F1]/30">
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="font-semibold text-gray-700 text-xs">
                        {uploadingImage ? 'Uploading to Cloudinary...' : 'Click to Upload Primary Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Extra Gallery Images */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-700 uppercase">
                      Additional Gallery Images (Optional)
                    </label>
                    <label className="text-[11px] text-[#701A23] font-bold hover:underline cursor-pointer flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      <span>Upload More</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.images.map((imgUrl, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                        <img src={imgUrl} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(i)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {formData.images.length === 0 && (
                      <p className="text-[11px] text-gray-400 italic">No extra gallery images added.</p>
                    )}
                  </div>
                </div>

                {/* 🎨 Color Variants Configuration Section */}
                <div className="p-4 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasColors}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            hasColors: checked,
                            colors: checked ? (prev.colors && prev.colors.length > 0 ? prev.colors : [
                              { name: 'Red', hex: '#E53E3E', image: '' },
                              { name: 'Black', hex: '#1A202C', image: '' }
                            ]) : []
                          }));
                        }}
                        className="w-4 h-4 text-[#701A23] rounded border-gray-300 focus:ring-[#701A23] cursor-pointer"
                      />
                      <span className="font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wide">
                        Enable Color Variants for this product (Sarees, Dresses, Shirts, T-Shirts)
                      </span>
                    </label>
                    {formData.hasColors && (
                      <span className="text-[11px] font-bold text-[#701A23] bg-[#701A23]/10 px-2.5 py-0.5 rounded-full">
                        {formData.colors?.length || 0} active colors
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Select colors available for this product and upload the specific photo for each color.
                  </p>

                  {formData.hasColors && (
                    <div className="pt-3 border-t border-gray-200 space-y-4 animate-fadeIn">
                      {/* Popular Color Presets */}
                      <div>
                        <span className="block text-[11px] font-bold text-gray-700 uppercase mb-2">
                          Popular Color Presets (Click to add/remove):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {POPULAR_COLORS.map((col) => {
                            const isSelected = (formData.colors || []).some(c => c.name.toLowerCase() === col.name.toLowerCase());
                            return (
                              <button
                                type="button"
                                key={col.name}
                                onClick={() => handleToggleColor(col)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-[#701A23] text-white border-[#701A23] shadow-xs'
                                    : 'bg-white text-gray-800 border-gray-200 hover:border-[#701A23] hover:bg-gray-50'
                                }`}
                              >
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0 shadow-inner"
                                  style={{ backgroundColor: col.hex }}
                                />
                                <span>{col.name}</span>
                                {isSelected && <span>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Color Adder */}
                      <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                        <span className="block text-[11px] font-bold text-gray-700 uppercase">
                          + Add Custom Color:
                        </span>
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                          <input
                            type="text"
                            value={customColorName}
                            onChange={(e) => setCustomColorName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomColor();
                              }
                            }}
                            placeholder="Color name (e.g. Mint Green, Coral Pink, Rust Orange)"
                            className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                          />
                          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-xl">
                            <span className="text-[11px] font-bold text-gray-600">Color:</span>
                            <input
                              type="color"
                              value={customColorHex}
                              onChange={(e) => setCustomColorHex(e.target.value)}
                              className="w-6 h-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddCustomColor}
                            className="px-4 py-2 bg-[#701A23] hover:bg-[#521117] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
                          >
                            + Add Color
                          </button>
                        </div>
                      </div>

                      {/* Active Color Cards with Image Upload */}
                      {(formData.colors || []).length > 0 && (
                        <div className="space-y-2.5 pt-1">
                          <span className="block text-[11px] font-bold text-gray-800 uppercase">
                            Upload Color-Specific Images:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {formData.colors.map((colorItem) => (
                              <div
                                key={colorItem.name}
                                className="p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-3 shadow-2xs relative group"
                              >
                                {/* Color preview circle */}
                                <div
                                  className="w-5 h-5 rounded-full border border-gray-300 shrink-0 shadow-inner"
                                  style={{ backgroundColor: colorItem.hex }}
                                  title={colorItem.hex}
                                />

                                {/* Color name & image */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-gray-900 truncate">
                                      {colorItem.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveColor(colorItem.name)}
                                      className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer"
                                      title="Remove color"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Image status / upload button */}
                                  <div className="mt-1.5 flex items-center gap-2">
                                    {colorItem.image ? (
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={colorItem.image}
                                          alt={colorItem.name}
                                          className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                                        />
                                        <label className="text-[10px] font-bold text-[#701A23] hover:underline cursor-pointer">
                                          Change
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleColorImageUpload(colorItem.name, e)}
                                            className="hidden"
                                          />
                                        </label>
                                      </div>
                                    ) : (
                                      <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-[10px] font-bold cursor-pointer transition-colors">
                                        <Upload className="w-3 h-3" />
                                        <span>
                                          {uploadingColorName === colorItem.name ? 'Uploading...' : 'Upload Photo'}
                                        </span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleColorImageUpload(colorItem.name, e)}
                                          className="hidden"
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Custom Size / Dimensions Configuration Section */}
                <div className="p-4 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasSizes}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const catLower = (formData.category || '').toLowerCase();
                          const isFrame = catLower.includes('photo') || catLower.includes('frame');
                          const defaultSizes = isFrame ? ['A3', 'A4', 'A5', 'A6'] : ['S', 'M', 'L', 'XL', 'XXL'];
                          setFormData(prev => ({
                            ...prev,
                            hasSizes: checked,
                            sizes: checked ? (prev.sizes && prev.sizes.length > 0 ? prev.sizes : defaultSizes) : []
                          }));
                        }}
                        className="w-4 h-4 text-[#701A23] rounded border-gray-300 focus:ring-[#701A23] cursor-pointer"
                      />
                      <span className="font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wide">
                        Enable Size / Dimension Options for this product
                      </span>
                    </label>
                    {formData.hasSizes && (
                      <span className="text-[11px] font-bold text-[#701A23] bg-[#701A23]/10 px-2.5 py-0.5 rounded-full">
                        {formData.sizes.length} active sizes
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {(formData.category || '').toLowerCase().includes('photo') || (formData.category || '').toLowerCase().includes('frame')
                      ? 'Enable to set Photo Frame dimensions (A3, A4, A5, A6) and size-specific prices.'
                      : 'Enable for variable sizes (S, M, L, XL, XXL) and size-specific prices. Keep unchecked for Sarees or fixed-size items.'}
                  </p>

                  {formData.hasSizes && (
                    <div className="pt-3 border-t border-gray-200 space-y-4 animate-fadeIn">
                      {/* Dynamic Category-Specific Size Presets */}
                      {(() => {
                        const catLower = (formData.category || '').toLowerCase();
                        const isFrame = catLower.includes('photo') || catLower.includes('frame');
                        const isShirt = catLower.includes('shirt') && !catLower.includes('t-shirt') && !catLower.includes('tshirt');

                        // Strict category checking: Photo frames only for Photo Frames, Apparel for others
                        const showFrames = isFrame;
                        const showApparel = !isFrame;
                        const showNumbered = isShirt;

                        return (
                          <div className="space-y-3.5">
                            {/* 🖼️ Photo Frame Presets (Shown ONLY when Photo Frames category is selected) */}
                            {showFrames && (
                              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 shadow-xs animate-fadeIn">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#701A23] uppercase">
                                    🖼️ Photo Frame Sizes &amp; Dimensions:
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const frameDefaults = ['A3', 'A4', 'A5', 'A6'];
                                      setFormData(prev => ({
                                        ...prev,
                                        hasSizes: true,
                                        sizes: Array.from(new Set([...prev.sizes, ...frameDefaults]))
                                      }));
                                    }}
                                    className="text-[10px] font-bold text-[#701A23] bg-white px-2 py-0.5 rounded-md border border-amber-300 hover:bg-amber-100 cursor-pointer transition-colors"
                                  >
                                    + Add A3, A4, A5, A6 All
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {['A3', 'A4', 'A5', 'A6', '4x6 in', '5x7 in', '6x8 in', '8x10 in', '8x12 in', '10x12 in', '12x18 in', 'Mini Desk Frame'].map((preset) => {
                                    const isSelected = formData.sizes.includes(preset);
                                    return (
                                      <button
                                        type="button"
                                        key={preset}
                                        onClick={() => handleToggleSize(preset)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-[#701A23] text-white shadow-xs'
                                            : 'bg-white text-gray-700 border border-amber-200 hover:border-[#701A23] hover:bg-amber-50'
                                        }`}
                                      >
                                        {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* 👕 Standard Apparel / T-Shirt / Shirt Sizes (Shown when NOT a photo frame) */}
                            {showApparel && (
                              <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200/60 shadow-xs animate-fadeIn">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="block text-[11px] font-bold text-gray-800 uppercase">
                                    👕 Standard Sizes (S, M, L, XL, XXL, 3XL):
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const apparelDefaults = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
                                      setFormData(prev => ({
                                        ...prev,
                                        hasSizes: true,
                                        sizes: Array.from(new Set([...prev.sizes, ...apparelDefaults]))
                                      }));
                                    }}
                                    className="text-[10px] font-bold text-[#701A23] bg-white border border-gray-300 hover:bg-gray-100 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                                  >
                                    + Add S to 3XL All
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'].map((preset) => {
                                    const isSelected = formData.sizes.includes(preset);
                                    return (
                                      <button
                                        type="button"
                                        key={preset}
                                        onClick={() => handleToggleSize(preset)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-[#701A23] text-white shadow-xs'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-[#701A23]'
                                        }`}
                                      >
                                        {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* 👔 Numbered Shirt Sizes (Shown for Shirts) */}
                            {showNumbered && (
                              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 shadow-xs animate-fadeIn">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="block text-[11px] font-bold text-gray-800 uppercase">
                                    👔 Numbered Sizes (Formal Shirts 38-44, Pants):
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const numDefaults = ['38', '40', '42', '44'];
                                      setFormData(prev => ({
                                        ...prev,
                                        hasSizes: true,
                                        sizes: Array.from(new Set([...prev.sizes, ...numDefaults]))
                                      }));
                                    }}
                                    className="text-[10px] font-bold text-[#701A23] bg-white border border-gray-300 hover:bg-gray-100 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                                  >
                                    + Add 38, 40, 42, 44 All
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {['28', '30', '32', '34', '36', '38', '40', '42', '44', '2.4', '2.6', '2.8'].map((numSize) => {
                                    const isSelected = formData.sizes.includes(numSize);
                                    return (
                                      <button
                                        type="button"
                                        key={numSize}
                                        onClick={() => handleToggleSize(numSize)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-[#701A23] text-white shadow-xs'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-[#701A23]'
                                        }`}
                                      >
                                        {isSelected ? `✓ ${numSize}` : `+ ${numSize}`}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Custom Size / Dimension Adder */}
                      <div>
                        <span className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">
                          Add Custom Size or Frame Dimension:
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customSizeInput}
                            onChange={(e) => setCustomSizeInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomSize();
                              }
                            }}
                            placeholder="Type any custom size (e.g. A3, A4, 12x18 in, 8x10 in, Custom Size)"
                            className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomSize}
                            className="px-4 py-2 bg-[#701A23] hover:bg-[#521117] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
                          >
                            + Add Size
                          </button>
                        </div>
                      </div>

                      {/* Active Selected Size Tags */}
                      {formData.sizes.length > 0 && (
                        <div className="pt-2">
                          <span className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">
                            Active Sizes / Dimensions for this Product:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {formData.sizes.map((s, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold shadow-xs"
                              >
                                <span>{s}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSize(s)}
                                  className="text-amber-700 hover:text-red-600 cursor-pointer p-0.5"
                                  title="Remove size"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Size-Based Pricing Table / Inputs */}
                      {formData.sizes.length > 0 && (
                        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5 animate-fadeIn">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                              💰 Set Selling Price for each Size (₹):
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              Customers will see & pay the specific price for their chosen size
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {formData.sizes.map((s) => (
                              <div key={s} className="bg-white p-2 rounded-lg border border-emerald-200 shadow-2xs">
                                <label className="block text-[11px] font-bold text-gray-800 mb-1 truncate">
                                  {s} Price:
                                </label>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                                  <input
                                    type="number"
                                    value={formData.sizePrices?.[s] ?? ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData(prev => ({
                                        ...prev,
                                        sizePrices: {
                                          ...(prev.sizePrices || {}),
                                          [s]: val === '' ? '' : Number(val)
                                        }
                                      }));
                                    }}
                                    placeholder="e.g. 899"
                                    className="w-full pl-6 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Specifications (Point-Wise) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-gray-700 uppercase">
                      Product Specifications (Point-Wise)
                    </label>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Enter each spec on a new line (e.g. • 100% Cotton)
                    </span>
                  </div>
                  <textarea
                    rows="4"
                    value={formData.specifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
                    placeholder="Enter points (one per line):&#10;• 100% Pure Organic Cotton / Silk Blend&#10;• Frame Material: Synthetic Matte Wood&#10;• Includes Sturdy Wall Hooks & Table Stand&#10;• Premium Quality Zari Border&#10;• Dry Clean / Easy Wipe Clean"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Product Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide rich details on weave, occasion, color, border, and style recommendations..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                  />
                </div>

                {/* Toggles: Stock, Best Seller, Trending, Featured, New */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="w-4 h-4 text-[#701A23] rounded border-gray-300 focus:ring-[#701A23] cursor-pointer"
                    />
                    <span className="font-bold text-gray-700">In Stock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData(prev => ({ ...prev, isBestSeller: e.target.checked }))}
                      className="w-4 h-4 text-[#701A23] rounded border-gray-300 focus:ring-[#701A23] cursor-pointer"
                    />
                    <span className="font-bold text-amber-700">Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isTrending}
                      onChange={(e) => setFormData(prev => ({ ...prev, isTrending: e.target.checked }))}
                      className="w-4 h-4 text-[#701A23] rounded border-gray-300 focus:ring-[#701A23] cursor-pointer"
                    />
                    <span className="font-bold text-rose-700">Trending</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="w-4 h-4 text-[#701A23] rounded border-gray-300 focus:ring-[#701A23] cursor-pointer"
                    />
                    <span className="font-bold text-purple-700">Featured on Home</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                      className="w-4 h-4 text-[#701A23] rounded border-gray-300 focus:ring-[#701A23] cursor-pointer"
                    />
                    <span className="font-bold text-blue-700">New Arrival</span>
                  </label>
                </div>
              </div>

              {/* Pinned Modal Footer */}
              <div className="px-6 py-4 sm:px-8 border-t border-gray-100 bg-gray-50/80 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-white transition-all cursor-pointer text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="flex-1 py-2.5 bg-[#701A23] hover:bg-[#521117] text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 shadow-md transition-all cursor-pointer text-xs sm:text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center border border-gray-100 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-gray-900">Delete Product?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Are you sure you want to delete <strong className="text-gray-800">"{deleteConfirmId}"</strong> from the catalogue?
            </p>
            <div className="flex gap-3 mt-5 text-xs">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
