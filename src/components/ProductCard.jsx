import React from 'react';
import { Heart, ShoppingBag, Eye, Star, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUI } from '../context/UIContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { openQuickView } = useUI();

  const isLiked = isInWishlist(product.id);

  const handleOrderWhatsApp = (e) => {
    e.stopPropagation();
    const msg = `Hello Sri Vastralaya, I am interested in purchasing "${product.name}" (Price: ₹${product.price}). Please share more details.`;
    window.open(`https://wa.me/919618093699?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div 
      onClick={() => openQuickView(product)}
      className="group bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col h-full cursor-pointer relative"
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/5 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* Top Overlay Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="bg-[#701A23] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              NEW
            </span>
          )}
          {product.discount && (
            <span className="bg-[#D4AF37] text-[#701A23] text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
              {product.discount}
            </span>
          )}
        </div>

        {/* Top Right Wishlist Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 shadow-sm ${
            isLiked 
              ? 'bg-red-50 text-red-500' 
              : 'bg-white/80 backdrop-blur-xs text-gray-600 hover:text-red-500 hover:bg-white'
          }`}
          title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
        </button>

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            className="bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold py-2 px-3.5 rounded-full shadow-lg flex items-center gap-1.5 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
          >
            <Eye className="w-3.5 h-3.5 text-[#701A23]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category Tag */}
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] block mb-1">
            {product.subcategory || product.category}
          </span>

          {/* Product Title */}
          <h3 className="font-serif text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#701A23] transition-colors mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-amber-500 mb-2">
            <div className="flex items-center">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="font-semibold text-gray-700">{product.rating}</span>
            <span className="text-gray-400 text-[11px]">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-[#701A23]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.oldPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="bg-[#701A23] hover:bg-[#521117] text-white py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleOrderWhatsApp}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs"
              title="Order on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Buy Info</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
