"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import HeroBanner from "../../../app/components/ui/HeroBanner";
import Carousel, { CategoryType } from "../../../app/components/ui/Carousel";
import Navbar from "../../../app/components/layout/Navbar";
import Footer from "../../../app/components/layout/Footer";
import { MediaItem } from "../../../app/data/mockData";
import * as tmdbApi from "../../../app/services/tmdb";

interface Category {
  id: string;
  title: string;
  items: MediaItem[];
  genreId?: number;
  mediaType?: "movie" | "tv";
}

const GENRE_CATEGORIES_TO_DISPLAY: string[] = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Horror",
  "Romance",
  "Science Fiction",
  "Fantasy",
  "Thriller",
];

// REMOVE THIS LINE: export const dynamic = 'force-dynamic';

export default function BrowsePage() {
  const [featuredItem, setFeaturedItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [heroBannerPool, setHeroBannerPool] = useState<MediaItem[]>([]);

  // This will cause the error - useSearchParams() in client component without Suspense
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  // ... rest of your component code remains the same


  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);

      const initialPromises = [
        tmdbApi.fetchTrendingByPage(1),
        tmdbApi.fetchPopularMoviesByPage(1),
        tmdbApi.fetchTopRatedShowsByPage(1),
        tmdbApi.fetchUpcomingMoviesByPage(1),
      ];

      const movieGenres = await tmdbApi.getGenreList("movie");

      const genreMap = new Map<string, number>();
      if (Array.isArray(movieGenres)) {
        movieGenres.forEach((genre) => genreMap.set(genre.name, genre.id));
      }

      // This block ensures we only fetch MOVIES for the genre-specific carousels.
      const genrePromises = GENRE_CATEGORIES_TO_DISPLAY.map((genreName) => {
        const genreId = genreMap.get(genreName);
        // The first argument 'movie' is key. It tells the API to only look for movies.
        return genreId
          ? tmdbApi.fetchMediaByGenreByPage("movie", genreId, 1)
          : Promise.resolve(null);
      });

      const allResults = await Promise.all([
        ...initialPromises,
        ...genrePromises,
      ]);

      const initialCategories: Category[] = [
        {
          id: "trending",
          title: "Trending Now",
          items: allResults[0]?.results || [],
          mediaType: "movie",
        },
        {
          id: "popular-movies",
          title: "Popular Movies",
          items: allResults[1]?.results || [],
          mediaType: "movie",
        },
        {
          id: "tv-shows",
          title: "Top Rated TV Shows",
          items: allResults[2]?.results || [],
          mediaType: "tv",
        },
        {
          id: "new-releases",
          title: "Upcoming Movies",
          items: allResults[3]?.results || [],
          mediaType: "movie",
        },
      ];

      const genreCategories: Category[] = GENRE_CATEGORIES_TO_DISPLAY.map(
        (genreName, index) => {
          const genreId = genreMap.get(genreName);
          const items = allResults[4 + index]?.results || [];
          return {
            id: `genre-${genreId}`,
            title: genreName,
            items: items,
            genreId: genreId,
            // We explicitly set the mediaType to 'movie' for these carousels.
            mediaType: "movie" as const,
          };
        }
      ).filter((cat) => cat.items.length > 0 && cat.genreId);

      setAllCategories([...initialCategories, ...genreCategories]);
      setIsLoading(false);
    };

    loadAllData();
  }, []);

  const changeFeaturedItem = useCallback(() => {
    if (heroBannerPool.length > 0) {
      const currentFeaturedId = featuredItem?.id;
      let newFeaturedItem = featuredItem;
      if (heroBannerPool.length > 1) {
        do {
          newFeaturedItem =
            heroBannerPool[Math.floor(Math.random() * heroBannerPool.length)];
        } while (newFeaturedItem?.id === currentFeaturedId);
      }
      setFeaturedItem(newFeaturedItem);
    }
  }, [heroBannerPool, featuredItem]);

  useEffect(() => {
    if (allCategories.length > 0 && heroBannerPool.length === 0) {
      const bannerPool: MediaItem[] =
        allCategories.find((cat) => cat.id === "trending")?.items || [];
      if (bannerPool.length > 0) {
        setHeroBannerPool(bannerPool);
        setFeaturedItem(bannerPool[0]);
      }
    }
  }, [allCategories, heroBannerPool]);

  useEffect(() => {
    if (allCategories.length === 0) return;
    if (categoryParam === "movies") {
      setFilteredCategories(
        allCategories.filter((cat) => cat.mediaType === "movie")
      );
    } else if (categoryParam === "tv") {
      setFilteredCategories(
        allCategories.filter((cat) => cat.mediaType === "tv")
      );
    } else {
      setFilteredCategories(allCategories);
    }
  }, [categoryParam, allCategories]);

  useEffect(() => {
    if (heroBannerPool.length < 2) return;
    const intervalId = setInterval(changeFeaturedItem, 12000);
    return () => clearInterval(intervalId);
  }, [heroBannerPool, changeFeaturedItem]);

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
              <div key={category.id}>
                <Carousel
                  title={category.title}
                  initialItems={category.items}
                  categoryType={
                    category.id.startsWith("genre-")
                      ? "genre"
                      : (category.id as CategoryType)
                  }
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
