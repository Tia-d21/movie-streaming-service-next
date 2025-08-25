"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Plus, ThumbsUp, Info, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMyList } from "../../../app/hooks/useMyList";
import { useFavorites } from "../../../app/hooks/useFavorites";
import { MediaItem } from "../../../app/data/mockData";
import { useUserProfile } from "../../../app/hooks/useUserProfile";
import { useAuthModal } from "../../../app/hooks/useAuthModal";

type MovieCardProps = MediaItem;

export default function MovieCard(props: MovieCardProps) {
  const { id, title, posterPath, releaseYear, rating, duration, category } =
    props;
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const { user } = useUserProfile();
  const { openModal } = useAuthModal();
  const { addToMyList, removeFromMyList, isInMyList } = useMyList();
  const { toggleFavorite, isFavorite } = useFavorites();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (user) {
      router.push(`/watch/${category}/${id}`);
    } else {
      openModal();
    }
  };

  const handleMyListToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      openModal();
      return;
    }
    if (isInMyList(id)) {
      removeFromMyList(id);
    } else {
      addToMyList(props);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      openModal();
      return;
    }
    toggleFavorite(props);
  };

  const handleInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/${category}/${id}`);
  };

  return (
    <motion.div
      className="relative group rounded-md overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      onClick={() => router.push(`/${category}/${id}`)}
    >
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={posterPath || "/poster-placeholder.svg"}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />

        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-black/70 flex flex-col justify-between p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <h3 className="text-white font-medium text-sm truncate pr-2">
                {title}
              </h3>
              <div className="flex items-center text-xs text-gray-300 mt-1">
                <span>{releaseYear}</span>
                {duration && (
                  <>
                    <span className="mx-1.5">•</span>
                    <span>{duration}</span>
                  </>
                )}
                <div className="ml-auto bg-red-600 text-white text-xs px-1.5 py-0.5 rounded">
                  {rating}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handlePlay}
                className="cursor-pointer p-1.5 bg-white rounded-full hover:bg-gray-200 transition-colors"
              >
                <Play size={16} className="text-black" />
              </button>
              <button
                onClick={handleMyListToggle}
                className="cursor-pointer p-1.5 bg-gray-800/80 rounded-full hover:bg-gray-700 transition-colors"
              >
                {isInMyList(id) ? (
                  <X size={16} className="text-white" />
                ) : (
                  <Plus size={16} className="text-white" />
                )}
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={`cursor-pointer p-1.5 rounded-full transition-colors ${
                  isFavorite(id)
                    ? "bg-red-600"
                    : "bg-gray-800/80 hover:bg-gray-700"
                }`}
              >
                <ThumbsUp
                  size={16}
                  className="text-white"
                  fill={isFavorite(id) ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={handleInfo}
                className="cursor-pointer p-1.5 bg-gray-800/80 rounded-full hover:bg-gray-700 transition-colors ml-auto"
              >
                <Info size={16} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
