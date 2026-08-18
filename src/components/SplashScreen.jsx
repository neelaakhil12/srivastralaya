import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [count, setCount] = useState(3);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Countdown
    const t1 = setTimeout(() => setCount(2), 1000);
    const t2 = setTimeout(() => setCount(1), 2000);
    
    // Reveal Image
    const t3 = setTimeout(() => setIsRevealed(true), 3000);
    
    // Fade out
    const t4 = setTimeout(() => setIsFadingOut(true), 4500);
    
    const t5 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5100); 

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#E2CDAE] flex items-center justify-center overflow-hidden ${isFadingOut ? 'animate-fade-out-splash' : ''}`}>
      {/* Background Image: Mobile vs Desktop */}
      <picture className="w-full h-full">
        {/* Mobile View Image */}
        <source media="(max-width: 639px)" srcSet="/splash-mobile.png" />
        {/* Desktop View Image (Unchanged) */}
        <img 
          src="/splash-image.png" 
          alt="Sri Vastralaya" 
          onError={(e) => {
            // Fallback if splash-mobile.png is not yet present
            if (e.target.src !== '/splash-image.png') {
              e.target.src = '/splash-image.png';
            }
          }}
          className={`w-full h-full object-cover transition-all duration-1000 ${isRevealed ? 'blur-0 scale-100' : 'blur-xl scale-110'}`} 
        />
      </picture>
      
      {/* Countdown Overlay */}
      {!isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div key={count} className="animate-fade-in text-8xl md:text-9xl font-bold font-serif text-white drop-shadow-2xl">
            {count}
          </div>
        </div>
      )}
    </div>
  );
}
