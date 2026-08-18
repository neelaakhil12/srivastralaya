import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, MessageCircle, Check, ShieldCheck, Truck } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductQuickViewModal() {
  const { quickViewProduct, closeQuickView } = useUI();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  React.useEffect(() => {
    if (quickViewProduct) {
      setQuantity(1);
      setSelectedImage(0);
      if (quickViewProduct.sizes && Array.isArray(quickViewProduct.sizes) && quickViewProduct.sizes.length > 0) {
        setSelectedSize(quickViewProduct.sizes[0]);
      } else {
        setSelectedSize(null);
      }
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const isLiked = isInWishlist(quickViewProduct.id);
  const images = quickViewProduct.images && quickViewProduct.images.length > 0
    ? quickViewProduct.images
    : [quickViewProduct.image];

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity, null, selectedSize);
    closeQuickView();
  };

  const handleBuyWhatsApp = () => {
    const msg = `Hello Sri Vastralaya, I would like to order "${quickViewProduct.name}" (Qty: ${quantity}, Price: ₹${quickViewProduct.price * quantity}). Please guide me with payment and delivery.`;
    window.open(`https://wa.me/919618093699?text=${encodeURIComponent(msg)}`, '_blank');
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
              src={images[selectedImage] || quickViewProduct.image}
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
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-white p-1 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                    selectedImage === idx ? 'border-[#701A23] shadow-xs' : 'border-gray-200 opacity-70 hover:opacity-100'
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
                ₹{quickViewProduct.price.toLocaleString('en-IN')}
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

            {/* Specifications */}
            <div className="bg-[#FAF8F5] p-3 rounded-lg text-xs space-y-1.5 text-gray-700 border border-gray-100">
              {quickViewProduct.fabric && (
                <p><strong className="text-gray-900">Fabric:</strong> {quickViewProduct.fabric}</p>
              )}
              {quickViewProduct.material && (
                <p><strong className="text-gray-900">Material:</strong> {quickViewProduct.material}</p>
              )}
              {quickViewProduct.length && (
                <p><strong className="text-gray-900">Dimensions:</strong> {quickViewProduct.length}</p>
              )}
            </div>

            {/* Size Selector if available */}
            {quickViewProduct.sizes && Array.isArray(quickViewProduct.sizes) && quickViewProduct.sizes.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-800 uppercase">Select Size:</label>
                <div className="flex flex-wrap items-center gap-2">
                  {quickViewProduct.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-9 h-9 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-[#701A23] text-white border-[#701A23] shadow-sm'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-[#701A23]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Modifier */}
            <div className="flex items-center gap-4 pt-2">
              <label className="text-xs font-bold text-gray-800 uppercase">Quantity:</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-semibold text-sm text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-6 mt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              {quickViewProduct.inStock !== false ? (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#701A23] hover:bg-[#521117] text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {quantity} to Cart • ₹{(quickViewProduct.price * quantity).toLocaleString('en-IN')}</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md opacity-90 cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  <span>Out of Stock</span>
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

            <button
              onClick={handleBuyWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order Directly via WhatsApp (+91 9618093699)</span>
            </button>

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
