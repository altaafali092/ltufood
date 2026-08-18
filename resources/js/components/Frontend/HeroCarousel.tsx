import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import React, { useState } from 'react';

export default function HeroCarousel({ heroItems, addToCart, Money, itemImage }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!heroItems || heroItems.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % heroItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? heroItems.length - 1 : prevIndex - 1
    );
  };

  return (
    // Main Container with your custom layout, background linear gradients, and rounded corners
    <div className="relative min-h-100 max-md:min-h-80 rounded-[28px] max-md:rounded-[22px] overflow-hidden bg-linear-to-br from-[#e7f6ee] to-[#f3f7f5] dark:from-[#0e1f14] dark:to-[#0a1118] border border-[#6bffb8]/22 dark:border-[#6bffb8]/14 flex flex-col justify-end group">
      
      {/* --- BACKGROUND IMAGES & GRADIENTS SLIDER --- */}
      <div 
        className="absolute inset-0 flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {heroItems.map((hero, index) => {
          const bgImg = itemImage ? itemImage(hero) : null;
          return (
            <div key={`bg-${hero.id || index}`} className="w-full h-full flex-shrink-0 relative">
              

              
              {/* Background Item Image */}
              {bgImg && (
                <img
                  src={bgImg}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-90 dark:opacity-80 pointer-events-none"
                />
              )}
            </div>
          );
        })}
      </div>

      
      <div 
        className="flex transition-transform duration-500 ease-out z-10"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {heroItems.map((hero, index) => (
          <div key={hero.id || index} className="w-full shrink-0 p-9 max-md:p-5 flex flex-col justify-end">
            <div className="relative max-w-md">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 bg-[#6bffb8]/12 border border-[#6bffb8]/22 rounded-full px-3.5 py-1 mb-5">
                <span className="text-[11px]">✦</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#00a37a] dark:text-[#6bffb8]">
                  Today's favourite
                </span>
              </div>
              
              {/* Title */}
              <h1
                className="text-[clamp(32px,4.5vw,48px)] font-black text-slate-200 dark:text-white leading-[1.1] mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {hero.title}
              </h1>
              
              {/* Description */}
              <p className="text-sm leading-[1.7] text-slate-200 dark:text-slate-300 mb-6 line-clamp-2">
                {hero.description}
              </p>
              
              {/* Pricing & Button Actions */}
              <div className="flex items-center gap-3.5 flex-wrap">
                <span
                  className="text-[26px] font-bold text-[#a3ebd9] dark:text-[#6bffb8]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {Money(hero.price)||""}
                </span>
                <button
                  onClick={() => addToCart && addToCart(hero)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-[#6bffb8] to-[#00d4aa] text-[#0d1117] text-sm font-semibold border-none cursor-pointer hover:opacity-90 transition-all shadow-md active:scale-95"
                >
                  🛒 Add to order
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* --- NAVIGATION CONTROLS --- */}
      {heroItems.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white dark:hover:bg-slate-900 z-20 cursor-pointer"
            aria-label="Previous slide"
          >
            <ArrowLeftCircle/>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white dark:hover:bg-slate-900 z-20 cursor-pointer"
            aria-label="Next slide"
          >
            <ArrowRightCircle/>
          </button>

          {/* Indicator dots centered at the bottom layout */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {heroItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'bg-[#00a37a] dark:bg-[#6bffb8] w-5' 
                    : 'bg-slate-300/60 dark:bg-slate-600/60 w-1.5'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}