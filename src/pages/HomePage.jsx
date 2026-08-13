import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Tag, Heart, Award, CheckCircle2, ShoppingBag, Star } from 'lucide-react';
import { InstagramIcon } from '../components/BrandIcons';
import { categories } from '../data/categories';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function HomePage({ setActivePage, onCategorySelect }) {
  const sliderImages = [
    '/slider/image.png',
    '/slider/image copy.png',
    '/slider/image copy 2.png',
    '/slider/image copy 3.png',
    '/slider/image copy 4.png',
    '/slider/image copy 5.png',
    '/slider/image copy 6.png',
    '/slider/image copy 7.png',
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 2000);
    return () => clearInterval(slideInterval);
  }, []);

  const featuredProducts = products.filter(p => p.isFeatured || p.isNew).slice(0, 4);
  const bestSellers = products.filter(p => p.rating >= 4.5 && !p.isNew).slice(0, 4);
  const trendingProducts = [...products].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 4);

  const instagramPosts = [
    { id: 1, image: "/products/generic-product.png" },
    { id: 2, image: "/products/generic-product.png" },
    { id: 3, image: "/products/generic-product.png" },
    { id: 4, image: "/products/generic-product.png" },
    { id: 5, image: "/products/generic-product.png" },
    { id: 5, image: "/products/generic-product.png" },
    { id: 6, image: "/products/generic-product.png" }
  ];

  const customerReviews = [
    { id: 1, name: "Sneha Reddy", location: "Hyderabad", text: "Absolutely loved the temple jewellery set! The quality is amazing for the price.", rating: 5 },
    { id: 2, name: "Priya Kumar", location: "Bangalore", text: "The sarees are so elegant and affordable. Fast delivery too!", rating: 5 },
    { id: 3, name: "Anjali Rao", location: "Chennai", text: "Best place to buy hair accessories for my daughter. Very unique collections.", rating: 4 },
    { id: 4, name: "Kavya Menon", location: "Kochi", text: "I bought a Kanjeevaram style saree and it looks so premium. Highly recommended.", rating: 5 },
    { id: 5, name: "Divya Sharma", location: "Mumbai", text: "Great customer service on WhatsApp. They helped me choose the right fit.", rating: 5 },
    { id: 6, name: "Meera Patel", location: "Ahmedabad", text: "The fancy items section has so many cute things! Will definitely shop again.", rating: 4 },
    { id: 7, name: "Lakshmi Iyer", location: "Pune", text: "Very happy with the photo frames. They look exactly like the pictures.", rating: 5 },
    { id: 8, name: "Shruti Desai", location: "Delhi", text: "The dresses are very comfortable and stylish. Perfect for daily wear.", rating: 5 },
    { id: 9, name: "Nandini Verma", location: "Jaipur", text: "Good quality materials and honest pricing just like they promised.", rating: 4 },
    { id: 10, name: "Geetha Krishnan", location: "Vijayawada", text: "Sri Vastralaya never disappoints. My go-to store for affordable fashion.", rating: 5 },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      <div className="flex flex-col">
        {/* 1. HERO SECTION (IMAGE SLIDER) */}
        <section className="relative overflow-hidden w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.5/1] lg:aspect-[3/1] max-h-[600px] bg-[#FAF8F5]">
          {sliderImages.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Slide ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />
          ))}
          {/* Slider Indicators */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
            {sliderImages.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>

          {/* Shop Now Button Overlay (Desktop Only) */}
          <div className="hidden sm:flex absolute inset-0 z-30 flex-col items-center justify-end pb-12 sm:pb-16 pointer-events-none">
            <button
              onClick={() => setActivePage('products')}
              className="pointer-events-auto bg-[#701A23]/90 hover:bg-[#521117] text-white px-8 py-3.5 rounded-full font-bold text-base flex items-center justify-center gap-2 shadow-2xl backdrop-blur-sm transition-all transform hover:scale-105 border border-white/20"
            >
              <span>SHOP NOW</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Shop Now Button (Mobile Only) */}
        <div className="sm:hidden flex justify-center mt-3 px-4">
          <button
            onClick={() => setActivePage('products')}
            className="bg-[#701A23] hover:bg-[#521117] text-white px-6 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-lg w-full max-w-[200px] transition-colors"
          >
            <span>SHOP NOW</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. SHOP BY CATEGORY ("EXPLORE OUR COLLECTIONS") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8" data-aos="fade-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">Curated Collections</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-1">EXPLORE OUR COLLECTIONS</h2>
          </div>
          <button
            onClick={() => setActivePage('categories')}
            className="text-xs font-bold text-[#701A23] hover:underline flex items-center gap-1"
          >
            VIEW ALL CATEGORIES →
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                if (onCategorySelect) onCategorySelect(cat.id);
                setActivePage('products');
              }}
              className="group relative aspect-square sm:aspect-auto sm:h-72 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 border border-gray-100"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 text-white flex flex-col justify-end space-y-1 sm:space-y-2">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                  {cat.itemCount}
                </span>
                <h3 className="font-serif text-base sm:text-2xl font-bold text-white leading-tight">
                  {cat.name}
                </h3>
                <p className="hidden sm:block text-xs text-gray-300 line-clamp-1">{cat.tagline}</p>

                <div className="pt-1 sm:pt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-[#701A23] text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded sm:rounded-lg group-hover:bg-[#521117] transition-colors">
                    SHOP NOW →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS / NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8" data-aos="fade-up">
        <div className="flex flex-col items-center justify-center mb-2 sm:mb-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a202c]">NEW ARRIVALS</h2>
          <div className="w-16 h-0.5 bg-gray-800 mt-2"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4.5 BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8" data-aos="fade-up">
        <div className="flex flex-col items-center justify-center mb-2 sm:mb-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a202c]">BEST SELLERS</h2>
          <div className="w-16 h-0.5 bg-gray-800 mt-2"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4.7 TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8" data-aos="fade-up">
        <div className="flex flex-col items-center justify-center mb-2 sm:mb-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a202c]">TRENDING PRODUCTS</h2>
          <div className="w-16 h-0.5 bg-gray-800 mt-2"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. BRAND INTRODUCTION */}
      <section className="max-w-4xl mx-auto text-center px-4 space-y-4" data-aos="fade-up">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Welcome to Sri Vastralaya</span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
          Bringing You Elegance, Quality & Honest Pricing
        </h2>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Founded by <strong className="text-gray-900">Praveen & Siri</strong>, Sri Vastralaya was built on a simple belief: <em>everyone deserves to wear beautiful, high-quality fashion without paying high prices.</em> From handcrafted sarees and sparkling jewellery to trendy hair accessories and lifestyle items, we curate every piece with care.
        </p>
      </section>


      {/* 7. WHY CHOOSE SRI VASTRALAYA */}
      <section className="bg-[#FAF8F5] py-12 border-y border-gray-100" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">The Sri Vastralaya Promise</span>
            <h2 className="font-serif text-3xl font-bold text-gray-900 mt-1">WHY SHOP WITH US?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#FAF0F1] text-[#701A23] flex items-center justify-center font-bold">
                01
              </div>
              <h4 className="font-serif font-bold text-lg text-gray-900">Quality Products</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                We select fabrics and accessories combining everyday durability, elegance, and soft comfort.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#FAF0F1] text-[#701A23] flex items-center justify-center font-bold">
                02
              </div>
              <h4 className="font-serif font-bold text-lg text-gray-900">Affordable Prices</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Fashion should be accessible. We offer honest, direct pricing without high retail markups.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#FAF0F1] text-[#701A23] flex items-center justify-center font-bold">
                03
              </div>
              <h4 className="font-serif font-bold text-lg text-gray-900">Elegant Designs</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Carefully picked traditional motifs, modern colors, and trendy accessories to make you shine.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#FAF0F1] text-[#701A23] flex items-center justify-center font-bold">
                04
              </div>
              <h4 className="font-serif font-bold text-lg text-gray-900">For Every Occasion</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Whether for daily wear, festive poojas, weddings, or gifting, find perfect picks right here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. INSTAGRAM SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" data-aos="fade-up">
        <div className="text-center space-y-1">
          <InstagramIcon className="w-6 h-6 text-[#701A23] mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-gray-900">FOLLOW US ON INSTAGRAM</h3>
          <p className="text-xs font-semibold text-[#D4AF37]">@sv_sri_vastralaya</p>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-4 hide-scroll snap-x">
          {instagramPosts.map((post) => (
            <div key={post.id} className="relative aspect-square w-40 sm:w-48 lg:w-56 shrink-0 snap-start rounded-xl overflow-hidden group">
              <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <InstagramIcon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" data-aos="fade-up">
        <div className="text-center space-y-1">
          <h2 className="font-serif text-3xl font-bold text-[#1a202c]">WHAT OUR CUSTOMERS SAY</h2>
          <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2"></div>
        </div>

        <div className="overflow-hidden relative w-full pt-2 pb-6">
          <div className="animate-marquee gap-4 sm:gap-6 pb-2">
            {/* First Set */}
            {customerReviews.map((review) => (
              <div key={`set1-${review.id}`} className="w-72 sm:w-80 shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col space-y-4 hover:shadow-md transition-shadow">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic flex-1">"{review.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0F1] text-[#701A23] flex items-center justify-center font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                    <p className="text-xs text-gray-500">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate Set for infinite loop */}
            {customerReviews.map((review) => (
              <div key={`set2-${review.id}`} className="w-72 sm:w-80 shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col space-y-4 hover:shadow-md transition-shadow">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic flex-1">"{review.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0F1] text-[#701A23] flex items-center justify-center font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                    <p className="text-xs text-gray-500">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL MAROON CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-aos="fade-up">
        <div className="bg-[#701A23] rounded-3xl p-8 sm:p-12 text-center text-white space-y-4 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Discover Your Style</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">Find Your Perfect Style Today</h2>
            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
              Explore our latest saree drapings, jewellery sets, and fashion accessories. Simple ordering and direct WhatsApp assistance!
            </p>
            <button
              onClick={() => setActivePage('products')}
              className="bg-[#D4AF37] hover:bg-[#c59b27] text-[#701A23] px-8 py-3.5 rounded-xl font-extrabold text-sm shadow-md transition-all inline-flex items-center gap-2 transform hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>SHOP NOW</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
