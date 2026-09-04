import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, CreditCard, Check, ShieldCheck, Truck } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function ProductQuickViewModal() {
  const { quickViewProduct, closeQuickView } = useUI();
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isLoggedIn, openAuthModal } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorImage, setColorImage] = useState(null);

  React.useEffect(() => {
    if (quickViewProduct) {
      setQuantity(1);
      setSelectedImage(0);
      if (quickViewProduct.sizes && Array.isArray(quickViewProduct.sizes) && quickViewProduct.sizes.length > 0) {
        const inStockSize = quickViewProduct.sizes.find(s => (typeof s === 'object' && s !== null ? s.inStock !== false : true)) || quickViewProduct.sizes[0];
        const sName = typeof inStockSize === 'object' && inStockSize !== null ? inStockSize.name : inStockSize;
        setSelectedSize(sName);
      } else {
        setSelectedSize(null);
      }
      if (quickViewProduct.colors && Array.isArray(quickViewProduct.colors) && quickViewProduct.colors.length > 0) {
        const inStockCol = quickViewProduct.colors.find(c => (typeof c === 'object' && c !== null ? c.inStock !== false : true)) || quickViewProduct.colors[0];
        const cName = typeof inStockCol === 'object' && inStockCol !== null ? inStockCol.name : inStockCol;
        setSelectedColor(cName);
        setColorImage(inStockCol.image || null);
      } else {
        setSelectedColor(null);
        setColorImage(null);
      }
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const isLiked = isInWishlist(quickViewProduct.id);
  const images = quickViewProduct.images && quickViewProduct.images.length > 0
    ? quickViewProduct.images
    : [quickViewProduct.image];

  // Dynamic price calculation based on selected size
  const currentPrice = (quickViewProduct.sizePrices && selectedSize && quickViewProduct.sizePrices[selectedSize] !== undefined && quickViewProduct.sizePrices[selectedSize] !== '')
    ? Number(quickViewProduct.sizePrices[selectedSize])
    : Number(quickViewProduct.price);

  // Stock calculations for selected color & size variants
  const selectedColorObj = quickViewProduct.colors?.find(c => (typeof c === 'object' && c !== null ? c.name : c) === selectedColor);
  const isColorOutOfStock = selectedColorObj ? selectedColorObj.inStock === false : false;

  const selectedSizeObj = quickViewProduct.sizes?.find(s => (typeof s === 'object' && s !== null ? s.name : s) === selectedSize);
  const isSizeOutOfStock = selectedSizeObj ? selectedSizeObj.inStock === false : false;

  const isTotalOutOfStock = quickViewProduct.inStock === false || isColorOutOfStock || isSizeOutOfStock;
  const outOfStockLabel = quickViewProduct.inStock === false
    ? 'Out of Stock'
    : (isColorOutOfStock
        ? `${selectedColor} - Out of Stock`
        : (isSizeOutOfStock ? `Size ${selectedSize} - Out of Stock` : 'Out of Stock'));

  const handleSelectColor = (col) => {
    const colName = typeof col === 'object' && col !== null ? col.name : col;
    setSelectedColor(colName);
    if (col && typeof col === 'object' && col.image) {
      setColorImage(col.image);
    }
  };

  const handleAddToCart = () => {
    if (isTotalOutOfStock) return;
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    const activeImg = colorImage || images[selectedImage] || quickViewProduct.image;
    addToCart(
      { ...quickViewProduct, image: activeImg, price: currentPrice },
      quantity,
      selectedColor,
      selectedSize
    );
    closeQuickView();
  };

  const handleBuyNow = () => {
    if (isTotalOutOfStock) return;
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    const activeImg = colorImage || images[selectedImage] || quickViewProduct.image;
    addToCart(
      { ...quickViewProduct, image: activeImg, price: currentPrice },
      quantity,
      selectedColor,
      selectedSize
    );
    closeQuickView();
    if (setIsCartOpen) setIsCartOpen(true);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark Backdrop */}
      <div 
        onClick={closeQuickView}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden z-10 my-8 border border-gray-100 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/80 hover:bg-white text-gray-700 hover:text-black rounded-full flex items-center justify-center shadow-md transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Image Gallery */}
        <div className="md:w-1/2 p-4 sm:p-6 bg-gray-50 flex flex-col justify-between">
          <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-white shadow-xs border border-gray-100 flex items-center justify-center mb-4">
            <img
              src={colorImage || images[selectedImage] || quickViewProduct.image}
              alt={quickViewProduct.name}
              className={`w-full h-full object-contain p-2 transition-all duration-300 ${
                quickViewProduct.inStock === false ? 'blur-[3px] opacity-55 grayscale-[30%]' : ''
              }`}
            />
            {quickViewProduct.discount && quickViewProduct.inStock !== false && (
              <span className="absolute top-3 left-3 bg-[#D4AF37] text-[#701A23] font-bold text-xs px-2.5 py-1 rounded-md shadow-xs">
                {quickViewProduct.discount}
              </span>
            )}
            {selectedColor && (
              <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white font-semibold text-[10px] px-2.5 py-1 rounded-md shadow-sm">
                Color: {selectedColor}
              </span>
            )}
            {quickViewProduct.inStock === false && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                <span className="bg-red-600 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg tracking-wider uppercase border border-red-700">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(idx);
                    setColorImage(null);
                  }}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-white p-1 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                    !colorImage && selectedImage === idx ? 'border-[#701A23] shadow-xs' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category & Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-[#D4AF37]">
                {quickViewProduct.subcategory || quickViewProduct.category}
              </span>
              {quickViewProduct.inStock !== false ? (
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <Check className="w-3 h-3" /> In Stock
                </span>
              ) : (
                <span className="bg-red-50 text-red-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-red-200">
                  <X className="w-3 h-3" /> Out of Stock
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl font-bold text-gray-900 leading-tight">
              {quickViewProduct.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="font-semibold text-gray-800">{quickViewProduct.rating}</span>
              <span className="text-gray-400">({quickViewProduct.reviewsCount} customer reviews)</span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 py-2 border-y border-gray-100">
              <span className="text-2xl font-extrabold text-[#701A23]">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {quickViewProduct.oldPrice && (
                <span className="text-base text-gray-400 line-through">
                  ₹{quickViewProduct.oldPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs text-emerald-600 font-semibold">Taxes included</span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {quickViewProduct.description}
            </p>

            {/* Point-Wise Specifications */}
            {((Array.isArray(quickViewProduct.specifications) && quickViewProduct.specifications.length > 0) || quickViewProduct.fabric || quickViewProduct.length) && (
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl text-xs space-y-2 text-gray-700 border border-gray-100">
                <span className="block font-bold text-gray-900 uppercase tracking-wide text-[11px]">
                  Product Specifications:
                </span>
                <ul className="space-y-1.5 pl-0.5">
                  {(Array.isArray(quickViewProduct.specifications) && quickViewProduct.specifications.length > 0
                    ? quickViewProduct.specifications
                    : [quickViewProduct.fabric && `Fabric: ${quickViewProduct.fabric}`, quickViewProduct.length && `Dimensions: ${quickViewProduct.length}`, quickViewProduct.material && `Material: ${quickViewProduct.material}`].filter(Boolean)
                  ).map((spec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700 font-medium">
                      <span className="text-[#701A23] font-bold text-sm leading-none mt-0.5">•</span>
                      <span>{spec.replace(/^[•\-*]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Color Selector if available */}
            {quickViewProduct.colors && Array.isArray(quickViewProduct.colors) && quickViewProduct.colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800 uppercase">
                    Select Color: {selectedColor && <span className="text-[#701A23] font-bold">({selectedColor})</span>}
                  </label>
                  {isColorOutOfStock && (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      Color Out of Stock
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {quickViewProduct.colors.map((color) => {
                    const colName = typeof color === 'object' && color !== null ? color.name : color;
                    const colHex = typeof color === 'object' && color !== null ? color.hex : '#000';
                    const colInStock = typeof color === 'object' && color !== null ? color.inStock !== false : true;
                    const isSelected = selectedColor === colName;
                    return (
                      <button
                        key={colName}
                        onClick={() => handleSelectColor(color)}
                        className={`min-h-9 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#701A23] text-white border-[#701A23] shadow-sm ring-2 ring-[#701A23]/20'
                            : colInStock
                              ? 'bg-white text-gray-800 border-gray-200 hover:border-[#701A23]'
                              : 'bg-gray-50 text-gray-400 border-dashed border-gray-300 hover:border-red-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0 shadow-xs"
                          style={{ backgroundColor: colHex || '#000' }}
                        />
                        <span className={!colInStock ? 'line-through opacity-75' : ''}>{colName}</span>
                        {!colInStock && (
                          <span className="text-[9px] font-extrabold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded ml-0.5">
                            Out of Stock
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector if available */}
            {quickViewProduct.sizes && Array.isArray(quickViewProduct.sizes) && quickViewProduct.sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800 uppercase">Select Size / Dimension:</label>
                  {isSizeOutOfStock ? (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      Size Out of Stock
                    </span>
                  ) : (
                    selectedSize && quickViewProduct.sizePrices?.[selectedSize] && (
                      <span className="text-[11px] font-bold text-[#701A23]">
                        Selected Size: ₹{Number(quickViewProduct.sizePrices[selectedSize]).toLocaleString('en-IN')}
                      </span>
                    )
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {quickViewProduct.sizes.map((size) => {
                    const sizeName = typeof size === 'object' && size !== null ? size.name : size;
                    const sizeInStock = typeof size === 'object' && size !== null ? size.inStock !== false : true;
                    const customPrice = quickViewProduct.sizePrices?.[sizeName];
                    const isSelected = selectedSize === sizeName;
                    return (
                      <button
                        key={sizeName}
                        onClick={() => setSelectedSize(sizeName)}
                        className={`min-h-9 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#701A23] text-white border-[#701A23] shadow-sm'
                            : sizeInStock
                              ? 'bg-white text-gray-800 border-gray-200 hover:border-[#701A23]'
                              : 'bg-gray-50 text-gray-400 border-dashed border-gray-300 hover:border-red-300'
                        }`}
                      >
                        <span className={!sizeInStock ? 'line-through opacity-75' : ''}>{sizeName}</span>
                        {customPrice && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                            ₹{Number(customPrice).toLocaleString('en-IN')}
                          </span>
                        )}
                        {!sizeInStock && (
                          <span className="text-[9px] font-extrabold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded ml-0.5">
                            Out of Stock
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Modifier */}
            <div className="flex items-center gap-4 pt-2">
              <label className="text-xs font-bold text-gray-800 uppercase">Quantity:</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  disabled={isTotalOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-semibold text-sm text-gray-800">{quantity}</span>
                <button
                  disabled={isTotalOutOfStock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-6 mt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              {!isTotalOutOfStock ? (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#701A23] hover:bg-[#521117] text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {quantity} to Cart • ₹{(currentPrice * quantity).toLocaleString('en-IN')}</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md opacity-90 cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  <span>{outOfStockLabel}</span>
                </button>
              )}

              <button
                onClick={() => toggleWishlist(quickViewProduct)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  isLiked
                    ? 'bg-red-50 text-red-500 border-red-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {!isTotalOutOfStock && (
              <button
                onClick={handleBuyNow}
                className="w-full bg-[#701A23] hover:bg-[#521117] text-white py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Pay (₹{(currentPrice * quantity).toLocaleString('en-IN')})</span>
              </button>
            )}


            {/* Micro Guarantees */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 px-1">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#701A23]" /> Fast Shipping Across India
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#701A23]" /> 100% Quality Inspected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
