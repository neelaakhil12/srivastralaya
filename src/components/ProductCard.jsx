import React from 'react';
import { Heart, ShoppingBag, Eye, Star, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { openQuickView } = useUI();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isLoggedIn, openAuthModal } = useAuth();
  const isLiked = wishlistItems.some((item) => item.id === product.id);

  // Check if product has tiered size pricing
  const sizePriceValues = (product.sizePrices && typeof product.sizePrices === 'object')
    ? Object.values(product.sizePrices).map(Number).filter(v => !isNaN(v) && v > 0)
    : [];
  const minPrice = sizePriceValues.length > 0 ? Math.min(...sizePriceValues, product.price) : product.price;
  const hasMultiplePrices = sizePriceValues.length > 1 && Math.min(...sizePriceValues) !== Math.max(...sizePriceValues);

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
      <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-white border border-gray-100/80 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-contain p-1 transition-all duration-500 ease-out ${
            product.inStock === false
              ? 'blur-[2.5px] opacity-55 grayscale-[30%]'
              : 'group-hover:scale-105'
          }`}
        />

        {/* Discount Badge */}
        {product.discount && product.inStock !== false && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-[#cd9a5b] text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded">
              {product.discount}
            </span>
          </div>
        )}

        {/* Out of Stock Overlay Badge */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-15 pointer-events-none">
            <span className="bg-red-600 text-white font-extrabold text-[10px] sm:text-xs px-3 py-1.5 rounded-lg shadow-md tracking-wider uppercase border border-red-700">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Heart */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className={`absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center z-20 shadow-sm transition-colors cursor-pointer ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
        </button>

        {/* Quick Add Button */}
        <div className="absolute bottom-2 left-2 right-2 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
          {product.inStock !== false ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoggedIn) {
                  openAuthModal();
                  return;
                }
                addToCart(product);
              }}
              className="w-full bg-[#fcf8f2] hover:bg-white text-gray-800 text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 rounded shadow-sm tracking-widest cursor-pointer"
            >
              QUICK ADD
            </button>
          ) : (
            <button 
              disabled
              className="w-full bg-red-600 text-white text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 rounded shadow-sm tracking-widest cursor-not-allowed opacity-90"
            >
              OUT OF STOCK
            </button>
          )}
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
          {hasMultiplePrices && (
            <span className="text-[11px] font-semibold text-gray-500">From</span>
          )}
          <span className="text-base sm:text-lg font-bold text-gray-900">
            ₹{minPrice.toLocaleString('en-IN')}
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
        {product.colors && Array.isArray(product.colors) && product.colors.length > 0 ? (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {product.colors.slice(0, 5).map((col, idx) => (
              <span
                key={idx}
                className="w-3 h-3 rounded-full border border-gray-300 shadow-2xs inline-block shrink-0"
                style={{ backgroundColor: col.hex || '#000' }}
                title={col.name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[10px] text-gray-500 font-semibold leading-none">
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        ) : (
          <div className="flex gap-1.5 mt-1">
            <div className="w-3 h-3 rounded-full bg-black border border-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-[#f5f5dc] border border-gray-300"></div>
          </div>
        )}
      </div>
    </div>
  );
}
