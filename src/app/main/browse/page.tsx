"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import HeroBanner from "../../../app/components/ui/HeroBanner";
import Carousel from "../../../app/components/ui/Carousel";
import Navbar from "../../../app/components/layout/Navbar";
import Footer from "../../../app/components/layout/Footer";
import { MediaItem } from "../../../app/data/mockData";
import {
  fetchTrending,
  fetchPopularMovies,
  fetchTopRatedShows,
  fetchUpcomingMovies,
} from "../../../app/services/tmdb";

type Category = {
  id: string;
  title: string;
  items: MediaItem[];
};

export default function BrowsePage() {
  const [featuredItem, setFeaturedItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  // --- NEW STATE ---
  // This state will hold the pool of items available for the HeroBanner.
  const [heroBannerPool, setHeroBannerPool] = useState<MediaItem[]>([]);

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  // This useEffect still runs ONCE to fetch all the data for the carousels
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);

      const [trending, popularMovies, topRatedShows, upcomingMovies] =
        await Promise.all([
          fetchTrending(),
          fetchPopularMovies(),
          fetchTopRatedShows(),
          fetchUpcomingMovies(),
        ]);

      const categoriesData: Category[] = [
        { id: "trending", title: "Trending Now", items: trending },
        { id: "popular-movies", title: "Popular Movies", items: popularMovies },
        { id: "tv-shows", title: "Top Rated TV Shows", items: topRatedShows },
        { id: "new-releases", title: "Upcoming Movies", items: upcomingMovies },
      ];

      setAllCategories(categoriesData);
      setIsLoading(false);
    };

    loadAllData();
  }, []);

  // This useEffect now has TWO jobs:
  // 1. Filter the carousels being displayed.
  // 2. Set the pool of items for the HeroBanner.
  useEffect(() => {
    if (allCategories.length === 0) return;

    let bannerPool: MediaItem[] = [];
    const trendingItems =
      allCategories.find((cat) => cat.id === "trending")?.items || [];

    if (categoryParam === "movies") {
      const popularMovies =
        allCategories.find((cat) => cat.id === "popular-movies")?.items || [];
      setFilteredCategories(
        [allCategories.find((cat) => cat.id === "popular-movies")!].filter(
          Boolean
        )
      );
      bannerPool = popularMovies; // On Movies page, pool is only movies
    } else if (categoryParam === "tv") {
      const topRatedShows =
        allCategories.find((cat) => cat.id === "tv-shows")?.items || [];
      setFilteredCategories(
        [allCategories.find((cat) => cat.id === "tv-shows")!].filter(Boolean)
      );
      bannerPool = topRatedShows; // On TV Shows page, pool is only TV shows
    } else {
      // On Home page, show all carousels and use trending for the banner pool
      setFilteredCategories(allCategories);
      bannerPool = trendingItems;
    }

    setHeroBannerPool(bannerPool);
    // Set the initial featured item right away
    if (bannerPool.length > 0) {
      setFeaturedItem(
        bannerPool[Math.floor(Math.random() * bannerPool.length)]
      );
    }
  }, [categoryParam, allCategories]);

  // --- NEW useEffect FOR THE 3-SECOND REFRESH ---
  // This hook sets up and tears down the timer.
  useEffect(() => {
    // Don't start the timer until we have a pool of items to choose from
    if (heroBannerPool.length === 0) return;

    // Set up the interval to run every 3000 milliseconds (3 seconds)
    const intervalId = setInterval(() => {
      // Pick a new random item from the current pool
      const newFeaturedItem =
        heroBannerPool[Math.floor(Math.random() * heroBannerPool.length)];
      setFeaturedItem(newFeaturedItem);
    }, 12000);

    // This is the crucial cleanup function. It runs when the user navigates
    // away, stopping the timer to prevent memory leaks.
    return () => clearInterval(intervalId);
  }, [heroBannerPool]); // The timer will reset if the pool of items changes (e.g., navigating from Home to Movies)

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            className="w-16 h-16 border-t-4 border-red-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : (
        <>
          {featuredItem && <HeroBanner item={featuredItem} />}

          <div className="container mx-auto px-4 py-8 space-y-12">
            {filteredCategories.map((category) => (
              <div key={category.id} className="mb-8">
                <Carousel title={category.title} movies={category.items} />
              </div>
            ))}
          </div>

          <Footer />
        </>
      )}
    </main>
  );
}
