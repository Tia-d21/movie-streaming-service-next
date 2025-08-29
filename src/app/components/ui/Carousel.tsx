"use client";

import { useState, useRef, useCallback } from "react";
import { MediaItem } from "../../data/mockData";
import MovieCard from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  fetchTrendingByPage,
  fetchPopularMoviesByPage,
  fetchTopRatedShowsByPage,
  fetchUpcomingMoviesByPage,
  fetchMediaByGenreByPage,
  PaginatedResponse,
} from "../../services/tmdb";

export type CategoryType =
  | "trending"
  | "popular-movies"
  | "tv-shows"
  | "new-releases"
  | "genre";

interface CarouselProps {
  title: string;
  initialItems: MediaItem[];
  categoryType: CategoryType;
  genreId?: number;
  mediaType?: "movie" | "tv";
}

export default function Carousel({
  title,
  initialItems,
  categoryType,
  genreId,
  mediaType = "movie",
}: CarouselProps) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- THIS IS THE FIX ---
  // We move fetchMoreData inside useCallback and update the dependency array.
  const loadMore = useCallback(async () => {
    // Helper function is now defined inside the callback that uses it.
    const fetchMoreData = async (
      pageNum: number
    ): Promise<PaginatedResponse | null> => {
      switch (categoryType) {
        case "trending":
          return fetchTrendingByPage(pageNum);
        case "popular-movies":
          return fetchPopularMoviesByPage(pageNum);
        case "tv-shows":
          return fetchTopRatedShowsByPage(pageNum);
        case "new-releases":
          return fetchUpcomingMoviesByPage(pageNum);
        case "genre":
          if (genreId) {
            return fetchMediaByGenreByPage(mediaType, genreId, pageNum);
          }
          return null;
        default:
          return null;
      }
    };

    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const response = await fetchMoreData(page);

    if (response && response.results.length > 0) {
      setItems((prev) => {
        const existingIds = new Set(
          prev.map((p) => `${p.id}-${p.media_type || mediaType}`)
        );
        const newItems = response.results.filter(
          (item) =>
            !existingIds.has(`${item.id}-${item.media_type || mediaType}`)
        );
        return [...prev, ...newItems];
      });
      setPage((prev) => prev + 1);
      if (response.page >= response.totalPages) {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
    setIsLoadingMore(false);
    // The dependency array is now more accurate, including everything
    // from the "outside" that the callback depends on.
  }, [isLoadingMore, hasMore, page, categoryType, genreId, mediaType]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    if (scrollWidth - scrollLeft - clientWidth < 300) {
      loadMore();
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1-2 z-10 bg-black/60 hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center w-9 h-9 rounded-full"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-scroll space-x-4 p-4 -m-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {items.map((item) => (
            <div
              key={`${item.id}-${item.media_type || mediaType}`}
              className="min-w-[180px] sm:min-w-[200px] md:min-w-[240px] lg:min-w-[280px]"
            >
              <MovieCard {...item} />
            </div>
          ))}
          {isLoadingMore && (
            <div className="flex items-center justify-center min-w-[100px] flex-shrink-0">
              <motion.div
                className="w-8 h-8 border-t-2 border-red-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1-2 z-10 bg-black/60 hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center w-9 h-9 rounded-full"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
