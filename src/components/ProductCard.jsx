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
      className="group bg-transparent overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer relative"
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/5 overflow-hidden rounded-xl">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-[#cd9a5b] text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded">
              {product.discount}
            </span>
          </div>
        )}

        {/* Wishlist Heart */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className={`absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center z-10 shadow-sm transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
        </button>

        {/* Quick Add Button */}
        <div className="absolute bottom-2 left-2 right-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
          <button 
             onClick={(e) => { e.stopPropagation(); addToCart(product); }}
             className="w-full bg-[#fcf8f2] hover:bg-white text-gray-800 text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 rounded shadow-sm tracking-widest"
          >
            QUICK ADD
          </button>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="pt-3 flex flex-col gap-1">
        {/* Brand Name */}
        <span className="text-[9px] sm:text-[10px] tracking-widest font-semibold text-gray-500 uppercase">
          {product.brand || "SRI VASTRALAYA"}
        </span>
        
        {/* Product Title */}
        <h3 className="text-sm sm:text-base text-gray-900 font-medium line-clamp-1 group-hover:text-[#701A23] transition-colors">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-500">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
               <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-gray-500 font-medium">({product.reviewsCount || 12})</span>
        </div>
        
        {/* Pricing */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-base sm:text-lg font-bold text-gray-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.oldPrice.toLocaleString('en-IN')}
            </span>
          )}
          {product.discount && (
            <span className="text-[10px] sm:text-xs font-bold text-[#cd9a5b]">
              ({product.discount})
            </span>
          )}
        </div>
        
        {/* Color Swatches */}
        <div className="flex gap-1.5 mt-1">
          <div className="w-3 h-3 rounded-full bg-black border border-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-[#f5f5dc] border border-gray-300"></div>
        </div>
      </div>
    </div>
  );
}
