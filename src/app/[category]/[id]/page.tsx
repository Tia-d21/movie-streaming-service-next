"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Plus, X, ChevronLeft, ThumbsUp } from "lucide-react";
import Navbar from "../../../app/components/layout/Navbar";
import Footer from "../../../app/components/layout/Footer";
import MovieCard from "../../../app/components/ui/MovieCard";
import { MediaItem } from "../../../app/data/mockData";
import { fetchMediaDetails } from "../../../app/services/tmdb";
import { useMyList } from "../../../app/hooks/useMyList";
import { useFavorites } from "../../../app/hooks/useFavorites";
import { useUserProfile } from "../../../app/hooks/useUserProfile";
import { useAuthModal } from "../../../app/hooks/useAuthModal";

export default function MovieDetails() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useUserProfile();
  const { openModal } = useAuthModal();
  const { addToMyList, removeFromMyList, isInMyList } = useMyList();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const loadDetails = async () => {
      setIsLoading(true);
      const category = params.category as "movie" | "tv";
      const id = params.id as string;
      if (category && id) {
        const foundItem = await fetchMediaDetails(id, category);
        setItem(foundItem);
      }
      setIsLoading(false);
    };
    loadDetails();
  }, [params.id, params.category]);

  const handleGoBack = () => router.back();

  const handlePlay = () => {
    if (user && item) {
      router.push(`/watch/${item.category}/${item.id}`);
    } else {
      openModal();
    }
  };

  const handleToggleMyList = () => {
    if (!user || !item) {
      openModal();
      return;
    }
    if (isInMyList(item.id)) {
      removeFromMyList(item.id);
    } else {
      addToMyList(item);
    }
  };

  const handleToggleFavorite = () => {
    if (!user || !item) {
      openModal();
      return;
    }
    toggleFavorite(item);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            className="w-16 h-16 border-t-4 border-red-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold mb-4">Content Not Found</h1>
          <p className="text-gray-400 mb-6">
            The requested movie or show could not be found.
          </p>
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            <ChevronLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isItemInMyList = item ? isInMyList(item.id) : false;
  const isItemFavorite = item ? isFavorite(item.id) : false;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="relative w-full h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={item.backdropPath || "/backdrop-placeholder.svg"}
            alt={item.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
        </div>

        <div className="relative h-full flex flex-col justify-end pb-20 px-4 sm:px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-2/3 lg:w-1/2"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {item.title}
            </h1>
            <div className="flex items-center text-sm text-gray-300 mb-4">
              <span className="bg-red-600 text-white px-2 py-0.5 rounded mr-3">
                {item.rating}
              </span>
              <span>{item.releaseYear}</span>
              {item.duration && (
                <>
                  <span className="mx-2">•</span>
                  <span>{item.duration}</span>
                </>
              )}
              {item.seasons && (
                <>
                  <span className="mx-2">•</span>
                  <span>{item.seasons} Seasons</span>
                </>
              )}
            </div>
            <p className="text-gray-300 mb-8 line-clamp-3 md:line-clamp-4">
              {item.overview}
            </p>

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlay}
                className="flex items-center bg-white text-black px-6 py-2 rounded font-medium cursor-pointer"
              >
                <Play className="mr-2" size={20} />
                Play
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleMyList}
                className="flex items-center bg-gray-600/80 text-white px-6 py-2 rounded font-medium cursor-pointer"
              >
                {isItemInMyList ? (
                  <X className="mr-2" size={20} />
                ) : (
                  <Plus className="mr-2" size={20} />
                )}
                {isItemInMyList ? "Remove from My List" : "Add to My List"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleFavorite}
                className={`flex items-center px-4 py-2 rounded font-medium cursor-pointer transition-colors ${
                  isItemFavorite
                    ? "bg-red-600 text-white"
                    : "bg-gray-600/80 text-white"
                }`}
              >
                <ThumbsUp
                  className="mr-2"
                  size={20}
                  fill={isItemFavorite ? "currentColor" : "none"}
                />
                {isItemFavorite ? "Favorited" : "Favorite"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        {item.cast && item.cast.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-6">Cast & Crew</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {item.cast.map((person, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-2">
                    <Image
                      src={person.profilePath}
                      alt={person.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-sm md:text-base">
                    {person.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    {person.character}
                  </p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {item.similar && item.similar.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {item.similar.map((similarItem) => (
                <MovieCard
                  key={similarItem.id}
                  {...similarItem}
                  // These props are missing from 'similar' type, provide defaults
                  overview=""
                  backdropPath=""
                  releaseYear=""
                  rating=""
                  genres={[]}
                  cast={[]}
                  similar={[]}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
