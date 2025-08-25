// movie-streaming-app\src\components\ui\Carousel.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";

// --- FIX 1: Import the correct MediaItem type ---
import { MediaItem } from "../../../app/data/mockData";

// We no longer need the local 'Movie' type definition, so it has been removed.

// --- FIX 2: Update the props to use the MediaItem type ---
type CarouselProps = {
  title: string;
  movies: MediaItem[];
};

export default function Carousel({ title, movies }: CarouselProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Number of items to show based on screen size
  const getItemsToShow = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 2; // Mobile
      if (window.innerWidth < 1024) return 3; // Tablet
      if (window.innerWidth < 1280) return 4; // Small desktop
      return 5; // Large desktop
    }
    return 5; // Default
  };

  const [itemsToShow, setItemsToShow] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      setItemsToShow(getItemsToShow());
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.ceil(movies.length / itemsToShow);

  const handleNext = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowLeftArrow(true);
      if (currentIndex + 2 >= totalSlides) {
        setShowRightArrow(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowRightArrow(true);
      if (currentIndex - 1 <= 0) {
        setShowLeftArrow(false);
      }
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium text-white mb-4 px-4 md:px-8">
        {title}
      </h2>

      <div className="relative group">
        {/* Left Navigation Arrow */}
        {showLeftArrow && (
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden px-4 md:px-8">
          <motion.div
            ref={carouselRef}
            className="flex space-x-2 md:space-x-4"
            animate={{ x: `-${currentIndex * 100}%` }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
          >
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="flex-none w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
              >
                {/* --- FIX 3: Use the spread operator --- */}
                <MovieCard key={movie.id} {...movie} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Navigation Arrow */}
        {showRightArrow && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
