import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Tag, Heart, Award, CheckCircle2, ShoppingBag } from 'lucide-react';
import { InstagramIcon } from '../components/BrandIcons';
import { categories } from '../data/categories';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function HomePage({ setActivePage, onCategorySelect }) {
  const [typedText, setTypedText] = useState('');
  const fullText = "TRADITION IN EVERY DRAPE";

  useEffect(() => {
    let i = 0;
    let isWaiting = false;
    const typingInterval = setInterval(() => {
      if (isWaiting) return;
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        isWaiting = true;
        setTimeout(() => {
          i = 0;
          setTypedText('');
          isWaiting = false;
        }, 1500);
      }
    }, 150);
    return () => clearInterval(typingInterval);
  }, []);

  const featuredProducts = products.filter(p => p.isFeatured || p.isNew).slice(0, 8);

  const trustPillars = [
    {
      icon: <Truck className="w-6 h-6 text-[#701A23]" />,
      title: "FREE SHIPPING",
      subtitle: "On orders above ₹2000"
    },
    {
      icon: <Award className="w-6 h-6 text-[#701A23]" />,
      title: "PREMIUM QUALITY",
      subtitle: "Finest fabrics & craft"
    },
    {
      icon: <Tag className="w-6 h-6 text-[#701A23]" />,
      title: "AFFORDABLE PRICES",
      subtitle: "For every budget"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#701A23]" />,
      title: "SECURE PAYMENTS",
      subtitle: "100% safe & verified"
    }
  ];

  const instagramPosts = [
    { id: 1, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80" },
    { id: 2, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80" },
    { id: 3, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80" },
    { id: 4, image: "https://images.unsplash.com/photo-1590564310418-66304f55a2c2?auto=format&fit=crop&w=400&q=80" },
    { id: 5, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80" },
    { id: 6, image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&q=80" }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#FAF8F5] border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10" data-aos="fade-right">
              <div className="inline-flex items-center gap-2 bg-[#FAF0F1] text-[#701A23] border border-[#F5DCD0] px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider max-w-full">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="truncate">Sv Sri Vastralaya Exclusive Collection</span>
              </div>

              <h1 className="font-serif font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight h-auto min-h-[3em]">
                Timeless Weaves, <br />
                <span className="text-[#701A23] relative inline-block pb-2">
                  {typedText}
                </span>
              </h1>

              <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Beautiful sarees. Honest prices. Made for every you. Discover handcrafted sarees, jewellery, hair accessories & fashion designed to elevate your everyday confidence.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setActivePage('products')}
                  className="w-full sm:w-auto bg-[#701A23] hover:bg-[#521117] text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActivePage('categories')}
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-colors"
                >
                  <span>Explore Categories</span>
                </button>
              </div>

              {/* Quick stats / highlights */}
              <div className="pt-6 border-t border-gray-200/60 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <h4 className="font-serif font-bold text-xl sm:text-2xl text-[#701A23]">100%</h4>
                  <p className="text-xs text-gray-500 font-medium">Authentic Fabrics</p>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xl sm:text-2xl text-[#701A23]">₹199+</h4>
                  <p className="text-xs text-gray-500 font-medium">Affordable Start</p>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xl sm:text-2xl text-[#701A23]">4.9★</h4>
                  <p className="text-xs text-gray-500 font-medium">Customer Rating</p>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Showcase */}
            <div className="lg:col-span-5 relative" data-aos="fade-left">
              <div className="relative aspect-4/5 max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
                  alt="Sri Vastralaya Fashion Saree"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating pill badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-xl border border-white/40 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#701A23] text-[#D4AF37] flex items-center justify-center font-serif font-bold">
                    SV
                  </div>
                  <div>
                    <h5 className="font-serif text-xs font-bold text-gray-900">ROYAL MAROON SILK</h5>
                    <p className="text-[11px] text-gray-600">Pure zari border drape • ₹899</p>
                  </div>
                  <button
                    onClick={() => setActivePage('products')}
                    className="ml-auto text-xs bg-[#701A23] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#521117]"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST PILLARS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-aos="fade-up">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPillars.map((pillar, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#FAF8F5] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#FAF0F1] flex items-center justify-center shrink-0 border border-[#F5DCD0]">
                {pillar.icon}
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-gray-900">{pillar.title}</h4>
                <p className="text-xs text-gray-500">{pillar.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BRAND INTRODUCTION */}
      <section className="max-w-4xl mx-auto text-center px-4 space-y-4" data-aos="fade-up">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Welcome to Sri Vastralaya</span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
          Bringing You Elegance, Quality & Honest Pricing
        </h2>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Founded by <strong className="text-gray-900">Praveen & Siri</strong>, Sri Vastralaya was built on a simple belief: <em>everyone deserves to wear beautiful, high-quality fashion without paying high prices.</em> From handcrafted sarees and sparkling jewellery to trendy hair accessories and lifestyle items, we curate every piece with care.
        </p>
      </section>

      {/* 4. SHOP BY CATEGORY ("EXPLORE OUR COLLECTIONS") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" data-aos="fade-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">Curated Collections</span>
            <h2 className="font-serif text-3xl font-bold text-gray-900 mt-1">EXPLORE OUR COLLECTIONS</h2>
          </div>
          <button
            onClick={() => setActivePage('categories')}
            className="text-xs font-bold text-[#701A23] hover:underline flex items-center gap-1"
          >
            VIEW ALL CATEGORIES →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                if (onCategorySelect) onCategorySelect(cat.id);
                setActivePage('products');
              }}
              className="group relative h-80 rounded-2xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 border border-gray-100"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute bottom-0 inset-x-0 p-5 text-white flex flex-col justify-end space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                  {cat.itemCount}
                </span>
                <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-1">{cat.tagline}</p>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#701A23] text-white px-3 py-1.5 rounded-lg group-hover:bg-[#521117] transition-colors">
                    SHOP NOW →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS / NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" data-aos="fade-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">Just Arrived</span>
            <h2 className="font-serif text-3xl font-bold text-gray-900 mt-1">NEW ARRIVALS</h2>
          </div>
          <button
            onClick={() => setActivePage('products')}
            className="text-xs font-bold text-[#701A23] hover:underline flex items-center gap-1"
          >
            VIEW ALL PRODUCTS →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. SPECIAL PROMO BANNERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-aos="fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Promo Card 1: Hair Accessories */}
          <div className="bg-[#FAF0F1] rounded-2xl p-6 sm:p-8 border border-[#F5DCD0] flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#701A23]">Special Collection</span>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1">HAIR ACCESSORIES</h3>
              <p className="text-xs text-gray-600 mt-2">Clips, Scrunchies, Pins & Juda decor starting at just ₹199.</p>
            </div>
            <button
              onClick={() => {
                if (onCategorySelect) onCategorySelect('hair-accessories');
                setActivePage('products');
              }}
              className="bg-[#701A23] hover:bg-[#521117] text-white py-2.5 px-4 rounded-xl text-xs font-bold self-start transition-colors"
            >
              EXPLORE NOW
            </button>
          </div>

          {/* Promo Card 2: Jewellery */}
          <div className="bg-[#F9F3DF] rounded-2xl p-6 sm:p-8 border border-[#E8D9AB] flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#701A23]">Timeless Beauty</span>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1">TEMPLE JEWELLERY</h3>
              <p className="text-xs text-gray-600 mt-2">Necklaces, Jhumkas & Pearl Sets crafted for traditional royalty.</p>
            </div>
            <button
              onClick={() => {
                if (onCategorySelect) onCategorySelect('jewellery');
                setActivePage('products');
              }}
              className="bg-[#701A23] hover:bg-[#521117] text-white py-2.5 px-4 rounded-xl text-xs font-bold self-start transition-colors"
            >
              EXPLORE NOW
            </button>
          </div>

          {/* Promo Card 3: Main Saree CTA */}
          <div className="bg-[#701A23] text-white rounded-2xl p-6 sm:p-8 border border-[#521117] flex flex-col justify-between space-y-4 shadow-lg">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Best Seller</span>
              <h3 className="font-serif text-2xl font-bold text-white mt-1">BEAUTIFUL SAREES AFFORDABLE PRICES</h3>
              <p className="text-xs text-gray-200 mt-2">For every mood. For every moment. Experience silk, linen & cotton drapes.</p>
            </div>
            <button
              onClick={() => {
                if (onCategorySelect) onCategorySelect('sarees');
                setActivePage('products');
              }}
              className="bg-[#D4AF37] hover:bg-[#c59b27] text-[#701A23] py-2.5 px-4 rounded-xl text-xs font-extrabold self-start transition-colors shadow-sm"
            >
              SHOP COLLECTION
            </button>
          </div>
        </div>
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {instagramPosts.map((post) => (
            <div key={post.id} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <InstagramIcon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FINAL MAROON CTA */}
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
