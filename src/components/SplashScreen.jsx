import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fading out after 2 seconds
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // Wait for the fade-out animation to finish (0.6s) before calling onComplete
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 600); 
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#701A23] flex items-center justify-center overflow-hidden ${isFadingOut ? 'animate-fade-out-splash' : ''}`}>
      {/* Background Flowing Silk Effect */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-[#521117] via-[#701A23] to-[#891E2A] mix-blend-overlay" />
      <div className="absolute w-[150%] h-[150%] -top-[25%] -left-[25%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent animate-silk-wave" />
      
      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
        {/* Animated Brand Logo */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white p-3 rounded-full flex items-center justify-center border-2 sm:border-4 border-[#D4AF37] animate-draw-monogram shadow-[0_0_30px_rgba(212,175,55,0.3)]">
          <img src="/logo.png" alt="Sri Vastralaya" className="w-full h-full object-contain" />
        </div>

        {/* Brand Name */}
        <div className="space-y-3">
          <h1 className="font-serif font-bold text-2xl sm:text-4xl text-white tracking-[0.15em] sm:tracking-[0.2em] animate-fade-in-up delay-500">
            SRI VASTRALAYA
          </h1>
          {/* Tagline */}
          <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase animate-fade-in-up delay-1000">
            Style &bull; Elegance &bull; Confidence
          </p>
        </div>
      </div>
    </div>
  );
}
