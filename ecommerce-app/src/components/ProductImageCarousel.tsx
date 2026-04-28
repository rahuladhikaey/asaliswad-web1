"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductImageCarousel({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-advance carousel every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(images.length / 2));
    }, 8000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(images.length / 2)) % Math.ceil(images.length / 2));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(images.length / 2));
  };

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStart - touchEnd > 75) handleNext();
    if (touchEnd - touchStart > 75) handlePrev();
  };

  const itemsPerSlide = 2;
  const totalSlides = Math.ceil(images.length / itemsPerSlide);
  const startIdx = currentIndex * itemsPerSlide;
  const visibleImages = images.slice(startIdx, startIdx + itemsPerSlide);

  return (
    <div className="relative w-full">
      <style jsx>{`
        @keyframes panLeftToRight {
          0%, 100% { transform: translateX(-8%) scale(1.2); }
          50% { transform: translateX(8%) scale(1.2); }
        }
        @keyframes panRightToLeft {
          0%, 100% { transform: translateX(8%) scale(1.2); }
          50% { transform: translateX(-8%) scale(1.2); }
        }
        .pan-lr {
          animation: panLeftToRight 12s ease-in-out infinite;
        }
        .pan-rl {
          animation: panRightToLeft 12s ease-in-out infinite;
        }
        .pan-lr:hover,
        .pan-rl:hover {
          animation-play-state: paused;
          transform: scale(1.15) !important;
        }
      `}</style>

      {/* Main Carousel Container */}
      <div
        ref={carouselRef}
        className="relative overflow-hidden rounded-[3rem] bg-white"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images Grid */}
        <div className={`grid gap-4 ${visibleImages.length > 1 ? "grid-cols-2" : "grid-cols-1"} p-4 bg-gradient-to-br from-slate-50 to-white`}>
          {visibleImages.map((img, idx) => (
            <div
              key={`${currentIndex}-${idx}`}
              className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white group transition-all duration-700 hover:shadow-2xl hover:shadow-slate-200/50 aspect-[4/5]"
            >
              <img
                src={img}
                alt={`${productName} - View ${startIdx + idx + 1}`}
                className={`h-full w-full object-cover transition-transform duration-700 ${
                  idx % 2 === 0 ? "pan-lr" : "pan-rl"
                }`}
              />

              {/* View Badge */}
              <div className="absolute bottom-4 left-4 flex h-8 items-center rounded-full bg-white/40 border border-white/50 px-3 backdrop-blur-xl shadow-sm">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900/70">
                  View {startIdx + idx + 1}
                </span>
              </div>

              {/* Zoom Indicator */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex h-8 items-center justify-center rounded-full bg-black/60 px-3 backdrop-blur-sm">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
                    🔍 Zoom
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95 group"
            aria-label="Previous images"
          >
            <ChevronLeft className="h-5 w-5 text-slate-900 group-hover:text-emerald-600 transition-colors" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95 group"
            aria-label="Next images"
          >
            <ChevronRight className="h-5 w-5 text-slate-900 group-hover:text-emerald-600 transition-colors" />
          </button>
        </>
      )}

      {/* Indicators/Dots */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? "bg-emerald-600 h-3 w-8 shadow-lg shadow-emerald-600/30"
                  : "bg-slate-200 h-2.5 w-2.5 hover:bg-slate-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      <div className="mt-4 flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400">
        <span>Product Gallery</span>
        <span className="text-emerald-600">
          {Math.min(startIdx + itemsPerSlide, images.length)} / {images.length} images
        </span>
      </div>
    </div>
  );
}
