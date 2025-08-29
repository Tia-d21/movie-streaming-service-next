"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import HeroBanner from "../../../app/components/ui/HeroBanner";
import Carousel, { CategoryType } from "../../../app/components/ui/Carousel";
import Navbar from "../../../app/components/layout/Navbar";
import Footer from "../../../app/components/layout/Footer";
import { MediaItem } from "../../../app/data/mockData";
import {
  fetchTrendingByPage,
  fetchPopularMoviesByPage,
  fetchTopRatedShowsByPage,
  fetchUpcomingMoviesByPage,
  getGenreList,
  fetchMediaByGenreByPage,
} from "../../../app/services/tmdb";

interface Category {
  id: string; // e.g., "trending", "popular-movies", "genre-28"
  title: string;
  items: MediaItem[];
  genreId?: number;
  mediaType?: 'movie' | 'tv';
}

const GENRE_CATEGORIES_TO_DISPLAY: string[] = [
  "Action", "Adventure", "Comedy", "Drama", "Horror", "Romance", "Science Fiction", "Fantasy", "Thriller",
];

export default function BrowsePage() {
  const [featuredItem, setFeaturedItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [heroBannerPool, setHeroBannerPool] = useState<MediaItem[]>([]);

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);

      const initialPromises = [
        fetchTrendingByPage(1),
        fetchPopularMoviesByPage(1),
        fetchTopRatedShowsByPage(1),
        fetchUpcomingMoviesByPage(1),
      ];
      
      const [movieGenres] = await Promise.all([ getGenreList('movie') ]);
      const genreMap = new Map<string, number>();
      movieGenres.forEach(genre => genreMap.set(genre.name, genre.id));

      const genrePromises = GENRE_CATEGORIES_TO_DISPLAY.map(genreName => {
        const genreId = genreMap.get(genreName);
        return genreId ? fetchMediaByGenreByPage('movie', genreId, 1) : Promise.resolve(null);
      });

      const allResults = await Promise.all([...initialPromises, ...genrePromises]);

      const initialCategories: Category[] = [
        { id: "trending", title: "Trending Now", items: allResults[0]?.results || [], mediaType: 'movie' },
        { id: "popular-movies", title: "Popular Movies", items: allResults[1]?.results || [], mediaType: 'movie' },
        { id: "tv-shows", title: "Top Rated TV Shows", items: allResults[2]?.results || [], mediaType: 'tv' },
        { id: "new-releases", title: "Upcoming Movies", items: allResults[3]?.results || [], mediaType: 'movie' },
      ];

      const genreCategories: Category[] = GENRE_CATEGORIES_TO_DISPLAY.map((genreName, index) => {
        const genreId = genreMap.get(genreName);
        return {
          id: `genre-${genreId}`,
          title: genreName,
          items: allResults[4 + index]?.results || [],
          genreId: genreId,
          mediaType: 'movie',
        };
      });

      setAllCategories([...initialCategories, ...genreCategories.filter(cat => cat.items.length > 0)]);
      setIsLoading(false);
    };

    loadAllData();
  }, []);

  useEffect(() => {
    if (allCategories.length === 0) return;
    const bannerPool: MediaItem[] = allCategories.find((cat) => cat.id === "trending")?.items || [];
    if (bannerPool.length > 0) {
      setHeroBannerPool(bannerPool);
      setFeaturedItem(bannerPool[Math.floor(Math.random() * bannerPool.length)]);
    }
  }, [allCategories]);
  
  useEffect(() => {
    if (categoryParam === "movies") {
      setFilteredCategories(allCategories.filter(cat => cat.mediaType === 'movie'));
    } else if (categoryParam === "tv") {
      setFilteredCategories(allCategories.filter(cat => cat.mediaType === 'tv'));
    } else {
      setFilteredCategories(allCategories);
    }
  }, [categoryParam, allCategories]);

  useEffect(() => {
    if (heroBannerPool.length === 0) return;
    const intervalId = setInterval(() => {
      const newFeaturedItem = heroBannerPool[Math.floor(Math.random() * heroBannerPool.length)];
      setFeaturedItem(newFeaturedItem);
    }, 12000);
    return () => clearInterval(intervalId);
  }, [heroBannerPool]);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div className="w-16 h-16 border-t-4 border-red-600 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
        </div>
      ) : (
        <>
          {featuredItem && <HeroBanner item={featuredItem} />}
          <div className="container mx-auto px-4 py-8 space-y-12">
            {filteredCategories.map((category) => (
              <div key={category.id}>
                <Carousel
                  title={category.title}
                  initialItems={category.items}
                  categoryType={category.id.startsWith('genre-') ? 'genre' : category.id as CategoryType}
                  genreId={category.genreId}
                  mediaType={category.mediaType}
                />
              </div>
            ))}
          </div>
          <Footer />
        </>
      )}
    </main>
  );
}